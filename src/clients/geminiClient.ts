import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let modelSingleton: GenerativeModel | null = null;

export function getGeminiModel(): GenerativeModel {
    if (modelSingleton) return modelSingleton;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY in env");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Fast/cheap for SMS-style responses
    modelSingleton = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    return modelSingleton;
}
