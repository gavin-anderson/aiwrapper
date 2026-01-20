import { getGeminiClient } from "../clients/geminiClient.js";
import { withRetry } from "../utils/retry.js";

const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-1.5-flash";

export async function modelReplyService(
  userText: string,
  from?: string
): Promise<string> {
  if (!userText.trim()) {
    return "Send me a message and I’ll reply.";
  }

  const ai = getGeminiClient();

  const prompt = [
    "Respond as if you are the Toronto icon Drake sending an SMS reply.",
    "Keep messages short, direct, and build a connection with the user.",
    from ? `User (${from}): ${userText}` : `User: ${userText}`,
  ].join("\n");

  const callModel = (model: string) =>
    ai.models.generateContent({
      model,
      contents: prompt,
    });

  try {
    const response = await withRetry(() => callModel(PRIMARY_MODEL), {
      retries: 4,
      baseDelayMs: 350,
      maxDelayMs: 3500,
    });

    const reply = response.text?.trim();
    if (!reply) return "I didn’t catch that — try again?";

    return reply.length > 1200 ? reply.slice(0, 1200) + "…" : reply;
  } catch (err: any) {
    // If primary model is overloaded, try fallback once (also with retry)
    const status = err?.status ?? err?.error?.code;
    if (status === 503 || status === 429) {
      const response = await withRetry(() => callModel(FALLBACK_MODEL), {
        retries: 2,
        baseDelayMs: 400,
        maxDelayMs: 2500,
      });

      const reply = response.text?.trim();
      if (!reply) return "I didn’t catch that — try again?";

      return reply.length > 1200 ? reply.slice(0, 1200) + "…" : reply;
    }

    console.error("Gemini error:", err);
    return "I’m a bit jammed up right now — try again in a minute.";
  }
}
