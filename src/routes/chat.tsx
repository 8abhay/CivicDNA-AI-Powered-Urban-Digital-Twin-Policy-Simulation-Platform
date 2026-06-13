import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChatPanel } from "@/components/ChatPanel";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "CivicDNA — AI Governance Officer" },
      { name: "description", content: "Conversational AI advisor for civic operations." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell>
      <div className="h-[calc(100vh-180px)]">
        <ChatPanel />
      </div>
    </AppShell>
  );
}