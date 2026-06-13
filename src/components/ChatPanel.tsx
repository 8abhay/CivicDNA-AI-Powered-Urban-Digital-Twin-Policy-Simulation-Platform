import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const SUGGESTIONS_EN = [
  "Summarize the city's current civic risk profile",
  "Why is healthcare stress elevated this hour?",
  "Recommend interventions for Hadapsar ward",
  "Draft a 3-line briefing for the Municipal Commissioner",
];
const SUGGESTIONS_MR = [
  "शहराच्या सध्याच्या जोखमीचे थोडक्यात वर्णन करा",
  "हडपसरसाठी हस्तक्षेप सुचवा",
  "महापालिका आयुक्तांसाठी 3-ओळींचा अहवाल लिहा",
];

export function ChatPanel() {
  const { t, lang } = useI18n();
  const [input, setInput] = useState("");
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status } = useChat({ transport });
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = async () => {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    setInput("");
    await sendMessage({ text });
  };

  const sugs = lang === "mr" ? SUGGESTIONS_MR : SUGGESTIONS_EN;

  return (
    <div className="glass flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Bot className="size-4 neon-cyan" />
          <h3 className="text-sm font-semibold tracking-wide">AI GOVERNANCE OFFICER</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">gemini-3-flash · streaming</span>
      </div>

      <div ref={scroller} className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Sparkles className="size-4 neon-magenta" />
              <span className="font-medium">Ask anything about your city.</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {sugs.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="text-left text-xs glass-soft p-3 hover:border-primary/40 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
              <div className={`size-7 rounded-md flex items-center justify-center shrink-0 ${isUser ? "bg-primary/20 text-primary" : "bg-fuchsia-500/15 text-fuchsia-300"}`}>
                {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-primary/15 border border-primary/30" : "bg-white/5 border border-border"}`}>
                {text || <span className="opacity-60">…</span>}
              </div>
            </div>
          );
        })}

        {(status === "submitted" || status === "streaming") && (
          <div className="flex gap-2">
            <div className="size-7 rounded-md flex items-center justify-center bg-fuchsia-500/15 text-fuchsia-300">
              <Bot className="size-3.5" />
            </div>
            <div className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="size-1.5 rounded-full bg-cyan-300 animate-bounce" />
                <span className="size-1.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:120ms]" />
                <span className="size-1.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        className="border-t border-border/60 p-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("ask_placeholder")}
          className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={status === "streaming" || status === "submitted" || !input.trim()}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="size-3.5" /> {t("send")}
        </button>
      </form>
    </div>
  );
}