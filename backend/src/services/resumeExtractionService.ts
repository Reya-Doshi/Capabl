import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  EMAIL_RE,
  PHONE_RE,
  classifyUrls,
  extractResumeUrls,
} from "./resumeService.js";

// ---------------------------------------------------------------------------
// Resume Intelligence Extraction (v4 Phase 1, spec Step 3).
//
// Turns raw resume text into a structured candidate profile the onboarding
// "Review Your Profile" screen pre-fills. AI-first (Gemini JSON), with a
// deterministic regex fallback so the flow never dead-ends when the model is
// unavailable. NOTHING here is persisted — the user confirms first.
// ---------------------------------------------------------------------------

export interface Education {
  degree?: string;
  institution?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  cgpa?: string;
}

export interface ProjectItem {
  title?: string;
  description?: string;
  technologies?: string[];
}

export interface Certification {
  name?: string;
  issuer?: string;
  year?: string;
}

export interface Experience {
  role?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ResumeExtraction {
  fullName: string;
  email: string;
  phone?: string;

  education: Education[];
  skills: string[];
  projects: ProjectItem[];
  certifications: Certification[];
  experience: Experience[];

  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;

  /** "ai" when Gemini produced the structure, "fallback" when regex did. */
  source: "ai" | "fallback";
}

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_KEY || ""
);

function uniqueStrings(values: any[] = []): string[] {
  return Array.from(
    new Set(values.map((v) => String(v || "").trim()).filter(Boolean))
  );
}

// Deterministic, dependency-free extraction. Pulls contact info + URLs via the
// shared regexes and classifies links into github/linkedin/portfolio. Section
// parsing is intentionally shallow here — it's the safety net, not the headline.
export function fallbackExtraction(text: string): ResumeExtraction {
  const safe = text || "";
  const email = safe.match(EMAIL_RE)?.[0] || "";
  const phone = safe.match(PHONE_RE)?.[0] || undefined;

  const rawUrls = extractResumeUrls(safe);
  const { githubUrl, linkedinUrl, portfolioUrl } = classifyUrls(rawUrls);

  // First non-empty line that looks like a name (letters/spaces, <= 5 words).
  const firstLine =
    safe
      .split(/\n/)
      .map((l) => l.trim())
      .find((l) => l && /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(l) && l.split(/\s+/).length <= 5) || "";

  return {
    fullName: firstLine,
    email,
    phone,
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    experience: [],
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    source: "fallback",
  };
}

const EXTRACTION_PROMPT = (resumeText: string) => `
You are a precise resume parser. Extract a structured candidate profile from the
resume text below. Use ONLY information that is actually present — never invent
data. If a field is absent, omit it (or use an empty array).

RESUME TEXT (first 6000 chars):
"""
${resumeText.slice(0, 6000)}
"""

Respond ONLY with valid JSON (no markdown, no backticks, no commentary) in EXACTLY this shape:
{
  "fullName": "string",
  "email": "string",
  "phone": "string (optional)",
  "education": [
    { "degree": "string", "institution": "string", "field": "string", "startYear": "string", "endYear": "string", "cgpa": "string" }
  ],
  "skills": ["string"],
  "projects": [
    { "title": "string", "description": "string", "technologies": ["string"] }
  ],
  "certifications": [
    { "name": "string", "issuer": "string", "year": "string" }
  ],
  "experience": [
    { "role": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string" }
  ],
  "githubUrl": "string (optional, full URL)",
  "linkedinUrl": "string (optional, full URL)",
  "portfolioUrl": "string (optional, full URL — any personal site that is not GitHub or LinkedIn)"
}

Rules:
- skills: deduplicated technology/skill names only (e.g. "React", "Python", "SQL").
- Keep project descriptions to one sentence.
- Only include a URL field if a matching link is present in the resume.
`;

function coerceArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

// Merge AI output with the regex fallback so we never lose a link the model
// missed, and always have contact basics. AI values win when present.
export async function extractResumeProfile(
  resumeText: string
): Promise<ResumeExtraction> {
  const fallback = fallbackExtraction(resumeText);

  if (!resumeText || resumeText.trim().length < 40) {
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent(EXTRACTION_PROMPT(resumeText));
    const raw = response.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Extraction response was not an object");
    }

    return {
      fullName: String(parsed.fullName || fallback.fullName || "").trim(),
      email: String(parsed.email || fallback.email || "").trim(),
      phone: (parsed.phone && String(parsed.phone).trim()) || fallback.phone,
      education: coerceArray<Education>(parsed.education),
      skills: uniqueStrings(parsed.skills),
      projects: coerceArray<ProjectItem>(parsed.projects),
      certifications: coerceArray<Certification>(parsed.certifications),
      experience: coerceArray<Experience>(parsed.experience),
      githubUrl: parsed.githubUrl || fallback.githubUrl,
      linkedinUrl: parsed.linkedinUrl || fallback.linkedinUrl,
      portfolioUrl: parsed.portfolioUrl || fallback.portfolioUrl,
      source: "ai",
    };
  } catch (err) {
    console.warn(
      "[resumeExtraction] AI extraction failed, using regex fallback:",
      (err as Error)?.message || err
    );
    return fallback;
  }
}
