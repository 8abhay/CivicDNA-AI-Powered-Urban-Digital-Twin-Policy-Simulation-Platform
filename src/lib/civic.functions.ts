import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway";

const RecommendInput = z.object({
  trafficIndex: z.number(),
  pollutionAQI: z.number(),
  emergencyLoad: z.number(),
  urbanRiskScore: z.number(),
  healthcareStress: z.number(),
  crimeHeatIndex: z.number(),
  cityStability: z.number(),
  alertLevel: z.string(),
  language: z.enum(["en", "mr"]).default("en"),
});

export const aiRecommendations = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RecommendInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gw = createLovableAiGatewayProvider(key);
    const lang = data.language === "mr" ? "Marathi" : "English";
    const { text } = await generateText({
      model: gw("google/gemini-3-flash-preview"),
      system:
        "You are CivicDNA — an AI Governance Officer advising IAS/IPS/Smart City teams. " +
        "Output 4 concise, prioritized, action-oriented recommendations as a numbered list. " +
        "Each item: ONE sentence, max 22 words, mention which department should act. No preamble.",
      prompt:
        `Current snapshot (respond in ${lang}):\n` +
        `Traffic Index: ${data.trafficIndex}/100\n` +
        `Pollution AQI: ${data.pollutionAQI}\n` +
        `Emergency Load: ${data.emergencyLoad}/hr\n` +
        `Urban Risk Score: ${data.urbanRiskScore}/100\n` +
        `Healthcare Stress: ${data.healthcareStress}/100\n` +
        `Crime Heat: ${data.crimeHeatIndex}/100\n` +
        `City Stability: ${data.cityStability}/100\n` +
        `Alert Level: ${data.alertLevel}`,
    });
    return { text };
  });

const SimInput = z.object({
  scheme: z.string(),
  schemeName: z.string(),
  intensity: z.number().min(0).max(100),
  baseline: z.record(z.string(), z.number()),
  predicted: z.record(z.string(), z.number()),
  language: z.enum(["en", "mr"]).default("en"),
});

export const aiSchemeNarrative = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SimInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gw = createLovableAiGatewayProvider(key);
    const lang = data.language === "mr" ? "Marathi" : "English";
    const { text } = await generateText({
      model: gw("google/gemini-3-flash-preview"),
      system:
        "You are a senior urban policy analyst. Given a government scheme deployment intensity " +
        "and predicted civic impact deltas, write a SHORT executive briefing (max 90 words) " +
        "with: (1) headline outcome (2) two risks (3) one rollout suggestion. Plain prose, no markdown.",
      prompt:
        `Respond in ${lang}.\n` +
        `Scheme: ${data.schemeName} at ${data.intensity}% deployment intensity.\n` +
        `Baseline civic state: ${JSON.stringify(data.baseline)}\n` +
        `Predicted percent-point deltas: ${JSON.stringify(data.predicted)}`,
    });
    return { text };
  });