import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PolishInput = z.object({
  residentName: z.string(),
  interests: z.array(z.string()),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      fact: z.string(),
      signals: z.array(z.string()),
    }),
  ),
});

export type PolishedReason = { id: string; reason: string };

/**
 * Rewrites the deterministic "why this fits you" lines in the voice of the
 * Residences Office. The rules layer already chose the items; the model only
 * rephrases. Any failure falls back to the rule-written copy.
 */
export const polishRecommendations = createServerFn({ method: "POST" })
  .validator((input: unknown) => PolishInput.parse(input))
  .handler(async ({ data }): Promise<{ items: PolishedReason[]; error?: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { items: [], error: "AI is not configured." };
    if (data.items.length === 0) return { items: [] };

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = [
      `Resident: ${data.residentName}. Stated interests: ${data.interests.join(", ") || "none given"}.`,
      "For each item below, write one warm, understated sentence (max 22 words) explaining why it is being suggested to this resident.",
      "Voice: a five-star residences concierge — precise, never salesy, no exclamation marks, no emoji, British-inflected but plain.",
      "Ground every sentence in the given signals and fact. Never invent facts. Address the resident as 'you'.",
      'Return ONLY minified JSON of the shape {"items":[{"id":"<id>","reason":"<sentence>"}]} with one entry per item and no other text.',
      "",
      ...data.items.map(
        (i) => `id: ${i.id}\ntitle: ${i.title}\nfact: ${i.fact}\nsignals: ${i.signals.join("; ")}`,
      ),
    ].join("\n");

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        prompt,
      });
      const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const parsed = z
        .object({ items: z.array(z.object({ id: z.string(), reason: z.string() })) })
        .parse(JSON.parse(json));
      const allowed = new Set(data.items.map((i) => i.id));
      const matched = parsed.items.filter((i) => allowed.has(i.id) && i.reason.trim().length > 0);
      if (matched.length > 0) return { items: matched };
      // Model renamed the ids: fall back to positional pairing.
      const positional = parsed.items
        .slice(0, data.items.length)
        .map((i, index) => ({ id: data.items[index]!.id, reason: i.reason }))
        .filter((i) => i.reason.trim().length > 0);
      if (positional.length > 0) return { items: positional };
      return { items: [], error: "The model returned no usable wording." };
    } catch (error) {
      console.error("polishRecommendations failed", error);
      return { items: [], error: "Personalised copy is unavailable just now." };
    }
  });
