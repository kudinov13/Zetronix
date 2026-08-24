import { Router, Request, Response } from "express";
import https from "node:https";
import crypto from "node:crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import db from "../db.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const router = Router();

const GIGACHAT_AUTH_KEY =
  "MDFhMDA0ZGItNDVmOC03M2IwLWEyYTctMjM5NTkxZTE1MWJlOmIwOWRjYjY3LTZjOWQtNDI1YS1iNTIzLWM5N2U0ZGI1ZDgxMw==";

const TG_BOT_TOKEN = "8687742873:AAGU97-qvPs4CWTEXcBhL5nGFTHJXEYjfT8";
const TG_CHAT_ID = "-5486997702";
const TG_PROXY = "http://user425172:apocw5@93.127.155.28:7165";
const tgAgent = new HttpsProxyAgent(TG_PROXY);

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getGigaChatToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  console.log("[chat] Requesting GigaChat token...");

  const resp = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${GIGACHAT_AUTH_KEY}`,
      RqUID: crypto.randomUUID(),
    },
    body: "scope=GIGACHAT_API_PERS",
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("[chat] GigaChat auth error:", resp.status, text);
    throw new Error(`GigaChat auth failed: ${resp.status}`);
  }

  const data = await resp.json() as { access_token: string; expires_at: number };
  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_at;
  console.log("[chat] GigaChat token acquired, expires at", new Date(data.expires_at).toISOString());
  return data.access_token;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildSystemPrompt(): string {
  const cases = db
    .prepare("SELECT title, excerpt FROM cases ORDER BY sort_order ASC")
    .all() as { title: string; excerpt: string }[];

  const categories = db
    .prepare("SELECT name FROM categories ORDER BY sort_order ASC")
    .all() as { name: string }[];

  const casesList = cases.length
    ? cases.map((c) => `- ${c.title}${c.excerpt ? ` — ${c.excerpt}` : ""}`).join("\n")
    : "(пока нет опубликованных кейсов)";

  const categoriesList = categories.length
    ? categories.map((c) => c.name).join(", ")
    : "(категории скоро появятся)";

  return `Ты — дружелюбный AI-ассистент студии Zetronix. Студия делает сайты и автоматизирует бизнес-процессы.

Твоя задача:
1. Ответить на вопросы клиента о студии и услугах
2. После 2-3 сообщений от клиента собери его данные: имя, контакт (телефон или мессенджер), и что ему нужно
3. Когда соберёшь все данные, скажи клиенту что передашь заявку менеджеру и прощайся

Информация о студии:
- Категории услуг: ${categoriesList}
- Кейсы и работы:
${casesList}
- Подробно кейсы можно посмотреть на zetronix.ru/cases

Правила:
- Отвечай кратко, дружелюбно, на русском языке
- Не выдумывай цены — скажи что цены обсуждаются индивидуально
- Если клиент спрашивает о кейсах — перечисли их из списка выше с кратким описанием (1 предложение на каждый)
- Не более 5 предложений в ответе
- Когда соберёшь имя, контакт и описание задачи, обязательно скажи "ЗАЯВКА_СОБРАНА" в конце своего ответа (это скрытый маркер для системы)`;
}

interface SessionState {
  messages: ChatMessage[];
  messageCount: number;
  leadCreated: boolean;
}

const sessions = new Map<string, SessionState>();

function sendTelegramNotification(lead: {
  id: number;
  name: string;
  contact: string;
  comment: string;
}) {
  const text =
    `🤖 Заявка от AI-бота #${lead.id}\n` +
    `👤 Имя: ${lead.name}\n` +
    `📞 Контакт: ${lead.contact}\n` +
    `💬 ${lead.comment}`;

  const payload = JSON.stringify({
    chat_id: TG_CHAT_ID,
    text,
    parse_mode: "HTML",
  });

  const options: https.RequestOptions = {
    hostname: "api.telegram.org",
    path: `/bot${TG_BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
    agent: tgAgent,
  };

  return new Promise<void>((resolve) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log("[chat] Telegram notification sent for AI lead #" + lead.id);
        } else {
          console.error("[chat] Telegram API error:", res.statusCode, body);
        }
        resolve();
      });
    });

    req.on("error", (err) => {
      console.error("[chat] Telegram notification failed:", err.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

function extractLeadData(conversation: ChatMessage[]): {
  name: string;
  contact: string;
  comment: string;
} | null {
  const fullText = conversation.map((m) => m.content).join("\n");

  const nameMatch = fullText.match(
    /(?:меня\s+зовут|я\s+|имя[:\s]+|это\s+)([А-ЯЁа-яёA-Za-z]{2,30})/i,
  );
  const contactMatch = fullText.match(
    /(\+?\d[\d\s\-\(\)]{7,18}|@[a-zA-Z0-9_]{3,30}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
  );

  const name = nameMatch?.[1]?.trim();
  const contact = contactMatch?.[1]?.trim();

  if (!name || !contact) return null;

  const comment = conversation
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .slice(0, 500);

  return { name, contact, comment };
}

async function callGigaChat(messages: ChatMessage[]): Promise<string> {
  const token = await getGigaChatToken();

  console.log("[chat] Calling GigaChat completions...");

  const resp = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages,
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("[chat] GigaChat API error:", resp.status, text);
    throw new Error(`GigaChat API error: ${resp.status}`);
  }

  const data = await resp.json() as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  console.log("[chat] GigaChat reply:", content.slice(0, 100));
  return content;
}

router.post("/", async (req: Request, res: Response) => {
  const { message, sessionId } = req.body as { message?: string; sessionId?: string };

  if (!message || !message.trim()) {
    res.status(400).json({ error: "Сообщение обязательно" });
    return;
  }

  const sid = sessionId || crypto.randomUUID();

  let session = sessions.get(sid);
  if (!session) {
    session = { messages: [], messageCount: 0, leadCreated: false };
    sessions.set(sid, session);
  }

  session.messages.push({ role: "user", content: message.trim() });
  session.messageCount++;

  const apiMessages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...session.messages.slice(-10),
  ];

  try {
    const reply = await callGigaChat(apiMessages);
    session.messages.push({ role: "assistant", content: reply });

    let leadCreated = false;

    if (reply.includes("ЗАЯВКА_СОБРАНА") && !session.leadCreated) {
      const leadData = extractLeadData(session.messages);
      if (leadData) {
        const info = db
          .prepare(
            "INSERT INTO leads (name, contact, template_slug, comment) VALUES (?, ?, ?, ?)",
          )
          .run(leadData.name, leadData.contact, null, leadData.comment);

        const leadId = info.lastInsertRowid as number;
        session.leadCreated = true;
        leadCreated = true;

        sendTelegramNotification({
          id: leadId,
          name: leadData.name,
          contact: leadData.contact,
          comment: leadData.comment,
        });
      }
    }

    const cleanReply = reply.replace("ЗАЯВКА_СОБРАНА", "").trim();

    res.json({
      reply: cleanReply,
      sessionId: sid,
      leadCreated,
    });
  } catch (err) {
    console.error("[chat] Error:", err instanceof Error ? err.message : String(err));
    res.status(500).json({
      error: "Не удалось получить ответ от AI. Попробуйте позже.",
      sessionId: sid,
    });
  }
});

export default router;
