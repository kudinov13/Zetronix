import { useState, useRef, useEffect, type FormEvent } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { api } from "@/lib/api";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Привет! Я AI-ассистент студии Zetronix. Помогу ответить на вопросы и оформить заявку. Что вас интересует?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [leadDone, setLeadDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || leadDone) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.chat(userMsg, sessionId);
      setSessionId(res.sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (res.leadCreated) {
        setLeadDone(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Не удалось получить ответ. Попробуйте позже или напишите нам в Telegram.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Открыть чат поддержки"
          className="fixed bottom-6 right-6 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform duration-200 hover:scale-105"
        >
          <MessageCircle aria-hidden className="size-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(520px,80dvh)] w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent/15">
                <Bot aria-hidden className="size-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI-ассистент</p>
                <p className="text-xs text-muted">Zetronix</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm text-accent-foreground"
                      : "max-w-[80%] rounded-2xl rounded-bl-md bg-background px-3.5 py-2.5 text-sm"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-background px-4 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {leadDone && (
              <div className="rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-center text-sm text-accent">
                Заявка отправлена! Мы свяжемся с вами.
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={leadDone ? "Заявка отправлена" : "Напишите сообщение…"}
              disabled={loading || leadDone}
              className="min-h-10 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-accent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || leadDone}
              aria-label="Отправить"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-accent text-accent-foreground transition-[filter] duration-200 hover:brightness-110 disabled:opacity-50"
            >
              <Send aria-hidden className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
