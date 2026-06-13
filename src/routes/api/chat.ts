import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

type Body = { messages?: UIMessage[] };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gw = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gw("google/gemini-3-flash-preview"),
          system:
            "You are CivicDNA, an AI Governance Officer for IAS/IPS, municipal corporations, " +
            "smart cities, and disaster management authorities in India. Speak in clear, calm, " +
            "decisive language. Provide actionable recommendations. When asked about civic risks, " +
            "explain (a) what the indicator means, (b) likely causes, (c) which department should " +
            "act, (d) 2–3 concrete interventions. If user writes Marathi, reply in Marathi. " +
            "Keep responses tight unless asked to elaborate.",
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});