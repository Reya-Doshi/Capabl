import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Centralised, text-only Gemini helper for JSON generation.
 *
 * Mirrors the call/parse pattern used in analysisService (gemini-2.5-flash,
 * strip ```json fences, JSON.parse). It is GUARANTEED never to throw — on any
 * failure (missing key, network, bad JSON) it returns null so the caller can
 * apply its own hardcoded fallback. Gemini produces TEXT ONLY here; scores and
 * gains are always computed by readinessService, never by the model.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateJson(prompt: string): Promise<any | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent(prompt);
    const raw = response.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.warn("geminiText.generateJson fallback:", err?.message || err);
    return null;
  }
}

export default { generateJson };
