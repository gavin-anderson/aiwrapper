import { getGeminiModel } from "../clients/geminiClient";

export async function modelReplyService(
  userText: string,
  from?: string
): Promise<string> {
  if (!userText.trim()) {
    return "Send me a message and I’ll reply.";
  }

  const model = getGeminiModel();

  const prompt = [
    "Respond as if you are the Toronto Icon Drake sending a SMS reply. Keep messags short, direct, and build a connection with the user.",
    from ? `User (${from}): ${userText}` : `User: ${userText}`,
  ].join("\n");

  const result = await model.generateContent(prompt);
  const reply = result.response.text()?.trim();

  if (!reply) {
    return "I didn’t catch that — try again?";
  }

  // SMS-safe length
  return reply.length > 1200 ? reply.slice(0, 1200) + "…" : reply;
}
