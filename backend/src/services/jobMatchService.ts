import { GoogleGenerativeAI } from "@google/generative-ai";

export interface JobMatchResult {
  matchScore: number;
  semanticScore: number;
  skillMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strongPoints: string[];
  weakPoints: string[];
  verdict: string;
  advice: string;
  jobTitle: string;
  company: string;
}

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(key);
}

function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  const dot = a.slice(0, length).reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

async function getEmbedding(text: string) {
  const model = getGeminiClient().getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

function clampScore(value: unknown, fallback = 50) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number)));
}

function parseJsonResponse(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini returned a non-JSON job match response");
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

export async function matchJobDescription(
  resumeText: string,
  extractedSkills: string[],
  careerFit: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const [resumeEmbedding, jobEmbedding] = await Promise.all([
    getEmbedding(resumeText.slice(0, 8000)),
    getEmbedding(jobDescription.slice(0, 8000)),
  ]);

  const rawSimilarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
  const semanticScore = clampScore(rawSimilarity * 100, 0);

  const flashModel = getGeminiClient().getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
You are a professional career coach analyzing how well a candidate matches a job description.

CANDIDATE PROFILE:
- Career Goal: ${careerFit}
- Known Skills: ${extractedSkills.join(", ")}
- Resume Content: ${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Analyze this match and respond ONLY with valid JSON:
{
  "jobTitle": "extracted job title from description",
  "company": "company name or empty string if not found",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strongPoints": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weakPoints": ["specific gap 1", "specific gap 2"],
  "skillMatchScore": 0,
  "advice": "2-3 sentence specific advice on how to improve match for this exact job"
}

Rules:
- matchedSkills: skills explicitly or semantically required by the job that the candidate has
- missingSkills: skills the job requires that the candidate clearly lacks
- strongPoints: specific reasons this candidate fits this job
- weakPoints: specific gaps for this exact job
- skillMatchScore: 0-100 based on skill overlap
- Keep advice actionable and specific to this job posting
`;

  const response = await flashModel.generateContent(prompt);
  const aiResult = parseJsonResponse(response.response.text());
  const skillMatchScore = clampScore(aiResult.skillMatchScore);
  const matchScore = Math.round(semanticScore * 0.5 + skillMatchScore * 0.5);

  const verdict =
    matchScore >= 80
      ? "Strong Match"
      : matchScore >= 65
      ? "Good Match"
      : matchScore >= 45
      ? "Partial Match"
      : "Weak Match";

  return {
    matchScore,
    semanticScore,
    skillMatchScore,
    matchedSkills: Array.isArray(aiResult.matchedSkills)
      ? aiResult.matchedSkills
      : [],
    missingSkills: Array.isArray(aiResult.missingSkills)
      ? aiResult.missingSkills
      : [],
    strongPoints: Array.isArray(aiResult.strongPoints)
      ? aiResult.strongPoints
      : [],
    weakPoints: Array.isArray(aiResult.weakPoints) ? aiResult.weakPoints : [],
    verdict,
    advice: aiResult.advice || "",
    jobTitle: aiResult.jobTitle || "Unknown Role",
    company: aiResult.company || "",
  };
}
