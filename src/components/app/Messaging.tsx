import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, EmptyState, Loader } from "@/components/ui-kit";
import { initialsFor } from "@/lib/auth";
import { getMessages, sendMessage, type ChatMessage, type Conversation } from "@/data/messages";
import { Send, Search, ArrowLeft } from "lucide-react";

/** "12:42" for today, "Mon" within the week, otherwise a short date. */
function formatStamp(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const daysAgo = (now.getTime() - date.getTime()) / 86_400_000;
  if (daysAgo < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

/**
 * Threads come from the route loader; messages are fetched when a thread is
 * opened, because opening one is also what marks it read.
 */
export function MessagingUI({ conversations }: { conversations: Conversation[] }) {
  const [threads, setThreads] = useState(conversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keeps the list fresh when the loader refetches after a navigation.
  useEffect(() => setThreads(conversations), [conversations]);

  const active = threads.find((c) => c.id === activeId) ?? null;

  const open = useCallback(async (id: string) => {
    setActiveId(id);
    setLoading(true);
    setError(null);
    try {
      setMessages(await getMessages({ data: id }));
      // The server just moved this thread's read watermark, so clear the badge.
      setThreads((current) => current.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load this conversation.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeId]);

  const send = async () => {
    if (!text.trim() || !activeId) return;
    const body = text;
    setText("");
    setError(null);
    try {
      const result = await sendMessage({ data: { conversationId: activeId, text: body } });
      if (!result.ok || !result.message) {
        setError(result.error ?? "The message could not be sent.");
        setText(body);
        return;
      }
      setMessages((current) => [...current, result.message!]);
      setThreads((current) =>
        current.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: body, lastMessageDate: result.message!.sentDate }
            : c,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The message could not be sent.");
      setText(body);
    }
  };

  const filtered = threads.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#080808] h-[calc(100vh-9rem)] flex">
      <aside
        className={
          "w-full md:w-72 lg:w-80 md:border-r border-white/10 flex-col " +
          (activeId ? "hidden md:flex" : "flex")
        }
      >
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-lg bg-white/[0.04] border border-white/10 pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-white/50">
              {threads.length === 0
                ? "No conversations yet. A thread opens when an advertiser sends a campaign request."
                : "No conversations match that search."}
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => open(c.id)}
                className={
                  "w-full flex items-center gap-3 px-3 py-3 text-left border-b border-white/5 " +
                  (activeId === c.id ? "bg-white/5" : "hover:bg-white/[0.03]")
                }
              >
                <Avatar initials={initialsFor(c.name)} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm truncate">{c.name}</p>
                    <span className="text-[10px] text-white/40">
                      {formatStamp(c.lastMessageDate)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    {c.lastMessage ?? c.subject ?? "No messages yet"}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/80 text-[10px] text-black px-1">
                    {c.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className={"flex-1 flex-col min-w-0 " + (activeId ? "flex" : "hidden md:flex")}>
        {active ? (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="md:hidden -ml-1 mr-1 h-9 w-9 inline-flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/5"
                aria-label="Back to conversations"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar initials={initialsFor(active.name)} size={36} />
              <div className="min-w-0">
                <p className="text-sm">{active.name}</p>
                <p className="text-[11px] text-white/50 truncate">
                  {active.subject ?? "Conversation"}
                </p>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-white/[0.01]"
            >
              {loading ? (
                <Loader label="Loading messages..." />
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={"flex " + (m.fromMe ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={
                        "max-w-[70%] rounded-2xl px-3 py-2 text-sm " +
                        (m.fromMe
                          ? "bg-white text-black rounded-br-sm"
                          : "bg-white/10 text-white rounded-bl-sm")
                      }
                    >
                      {m.text}
                      <span
                        className={
                          "ml-2 text-[10px] " + (m.fromMe ? "text-black/50" : "text-white/40")
                        }
                      >
                        {formatStamp(m.sentDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {error && (
              <p role="alert" className="px-4 pb-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="p-3 border-t border-white/10 flex items-center gap-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
                className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 disabled:opacity-40"
                disabled={!text.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState title="Select a conversation" />
          </div>
        )}
      </section>
    </div>
  );
}
