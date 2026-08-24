import { Router, Request, Response } from "express";
import https from "node:https";
import crypto from "node:crypto";
import fs from "node:fs";
import { HttpsProxyAgent } from "https-proxy-agent";
import db from "../db.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function logToFile(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync("/var/www/zetronix/chat.log", line);
}

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
    .prepare("SELECT title, excerpt, description, problem, solution, savings, price FROM cases ORDER BY sort_order ASC")
    .all() as { title: string; excerpt: string; description: string; problem: string; solution: string; savings: string; price: string }[];

  const categories = db
    .prepare("SELECT name FROM categories ORDER BY sort_order ASC")
    .all() as { name: string }[];

  const casesList = cases.length
    ? cases.map((c) => {
        let line = `- ${c.title}`;
        if (c.excerpt) line += ` — ${c.excerpt}`;
        if (c.description) line += ` | Описание: ${c.description}`;
        if (c.problem) line += ` | Проблема: ${c.problem}`;
        if (c.solution) line += ` | Решение: ${c.solution}`;
        if (c.savings) line += ` | Экономия: ${c.savings}`;
        if (c.price) line += ` | Цена: ${c.price}`;
        return line;
      }).join("\n")
    : "(пока нет опубликованных кейсов)";

  const categoriesList = categories.length
    ? categories.map((c) => c.name).join(", ")
    : "(категории скоро появятся)";

  return `Ты — дружелюбный AI-ассистент студии Zetronix. Студия делает сайты и автоматизирует бизнес-процессы.

Твоя задача — пообщаться с клиентом и СОБРАТЬ ЗАЯВКУ для менеджера.

Сценарий общения:
1. На первое сообщение клиента — ответь на его вопрос (используй информацию о студии ниже)
2. На второе сообщение — спроси как зовут клиента и его контакт (телефон, Telegram или email)
3. На третье сообщение — если у тебя уже есть имя и контакт, попрощайся и скажи что менеджер свяжется с ним
4. Если клиент не дал имя/контакт — попроси ещё раз, объясни что это нужно для связи

ЛЕAD-БЛОК — САМОЕ ВАЖНОЕ ПРАВИЛО:
Добавляй [LEAD]{"name":"Имя","contact":"Контакт","task":"Описание"}[/LEAD] в КОНЕЦ ответа ТОЛЬКО когда выполняются ВСЕ условия:
- Клиент НАЗВАЛ своё реальное имя (не пустая строка, не "имя клиента")
- Клиент НАЗВАЛ свой реальный контакт: телефон, email или telegram (не пустая строка)
- НИКОГДА не добавляй LEAD-блок с пустыми полями name или contact
- НИКОГДА не добавляй LEAD-блок если клиент ещё НЕ назвал имя или контакт
- LEAD-блок невидим для клиента

Примеры:
Клиент: "Меня зовут Михаил, телефон 89001234567" → добавь LEAD с name="Михаил", contact="89001234567"
Клиент: "Расскажите про кейсы" → НЕ добавляй LEAD (нет имени и контакта)
Клиент: "Меня зовут Олег" → НЕ добавляй LEAD (нет контакта)

В поле task — что нужно клиенту + способ связи если он его назвал (например "просит написать в мессенджер Max").

Когда собирать данные:
- Если клиент задаёт вопрос, на который у тебя нет точного ответа — скажи что уточнишь у менеджера, и попроси имя + контакт
- Если клиент спрашивает про цены — скажи что цены индивидуальны, попроси описать задачу и оставить контакт для расчёта
- Если клиент уже описал что ему нужно — просто спроси имя и контакт
- ВСЕГДА пытайся получить имя и контакт, чтобы передать заявку менеджеру

Информация о студии:
- Категории услуг: ${categoriesList}
- Кейсы и работы (используй эти данные для ответов):
${casesList}
- Подробно кейсы на zetronix.ru/cases

Правила:
- Отвечай кратко, дружелюбно, на русском языке
- Не более 4 предложений в ответе
- Не выдумывай цены и цифры, которых нет в данных выше`;
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
          logToFile("[chat] Telegram notification sent for AI lead #" + lead.id);
        } else {
          logToFile("[chat] Telegram API error: " + res.statusCode + " " + body);
        }
        resolve();
      });
    });

    req.on("error", (err) => {
      logToFile("[chat] Telegram notification failed: " + err.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

function extractLeadFromReply(reply: string): {
  name: string;
  contact: string;
  task: string;
} | null {
  const match = reply.match(/\[LEAD\](\{[\s\S]*?\})(?:\[\/LEAD\]|$)/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]) as { name?: string; contact?: string; task?: string };
    const name = (data.name || "").trim();
    const contact = (data.contact || "").trim();
    if (name.length > 1 && contact.length > 2 && name !== "Имя" && contact !== "Контакт") {
      return {
        name,
        contact,
        task: (data.task || "").trim(),
      };
    }
  } catch {
    logToFile("[chat] Failed to parse LEAD JSON from reply: " + match[1].slice(0, 100));
  }
  return null;
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
    logToFile("[chat] AI reply: " + reply.slice(0, 200));

    let leadCreated = false;

    const leadData = extractLeadFromReply(reply);
    if (leadData && !session.leadCreated) {
      const userMessages = session.messages
        .filter((m) => m.role === "user")
        .map((m) => m.content.toLowerCase());

      const contactPrefs: string[] = [];
      const prefKeywords: { pref: string; keywords: string[] }[] = [
        { pref: "написать в мессенджер Max", keywords: ["макс", "max"] },
        { pref: "написать в Telegram", keywords: ["telegram", "телеграм", "тг"] },
        { pref: "позвонить", keywords: ["позвонит"] },
        { pref: "написать в WhatsApp", keywords: ["whatsapp", "вацап", "вотсап"] },
      ];

      for (const { pref, keywords } of prefKeywords) {
        if (userMessages.some((m) => keywords.some((k) => m.includes(k)))) {
          contactPrefs.push(pref);
        }
      }

      let finalTask = leadData.task;
      if (!finalTask) {
        const userTexts = session.messages.filter((m) => m.role === "user").map((m) => m.content);
        finalTask = userTexts.slice(1).join(" ").slice(0, 300) || userTexts[0] || "Обращение через AI-бота";
      }
      if (contactPrefs.length > 0) {
        finalTask = finalTask + ". Просит: " + contactPrefs.join(", ");
      }

      const info = db
        .prepare(
          "INSERT INTO leads (name, contact, template_slug, comment) VALUES (?, ?, ?, ?)",
        )
        .run(leadData.name, leadData.contact, null, finalTask);

      const leadId = info.lastInsertRowid as number;
      session.leadCreated = true;
      leadCreated = true;

      sendTelegramNotification({
        id: leadId,
        name: leadData.name,
        contact: leadData.contact,
        comment: finalTask,
      }).catch((e) => logToFile("[chat] Telegram send error: " + e.message));
    }

    const cleanReply = reply.replace(/\[LEAD\][\s\S]*?(\[\/LEAD\]|$)/, "").trim();

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
