import fs from "fs";
import path from "path";

let pdfParseFn = null;
async function getPdfParse() {
  if (pdfParseFn) return pdfParseFn;
  try {
    const mod = await import("pdf-parse/lib/pdf-parse.js");
    pdfParseFn = mod.default || mod;
  } catch {
    pdfParseFn = null;
  }
  return pdfParseFn;
}

const SECTION_HEADERS = [
  "education",
  "experience",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "internship",
  "summary",
  "objective",
  "contact",
];

const ATS_KEYWORDS_GENERIC = [
  "experience",
  "project",
  "skill",
  "education",
  "team",
  "developed",
  "built",
  "designed",
  "implemented",
  "improved",
  "collaborated",
];

const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const EMAIL_RE = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
const URL_RE = /(https?:\/\/[^\s)]+)/g;

export async function extractResumeText(resumePath) {
  if (!resumePath) return "";

  const abs = path.isAbsolute(resumePath)
    ? resumePath
    : path.join(process.cwd(), resumePath);

  if (!fs.existsSync(abs)) return "";

  const ext = path.extname(abs).toLowerCase();
  const buf = fs.readFileSync(abs);

  if (ext === ".pdf") {
    const parser = await getPdfParse();
    if (parser) {
      try {
        const result = await parser(buf);
        if (result?.text) return result.text;
      } catch {
        /* fall through to byte read */
      }
    }
  }

  return buf.toString("utf8");
}

export function analyzeResumeText(text, requiredSkills) {
  if (!text || !text.trim()) {
    return {
      ok: false,
      reason: "Resume text could not be extracted",
      resumeScore: 0,
      atsScore: 0,
      foundSkills: [],
      missingKeywords: [],
      sectionsFound: [],
      contact: {},
      wordCount: 0,
    };
  }

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const sectionsFound = SECTION_HEADERS.filter((h) =>
    lower.includes(h)
  );

  const foundSkills = (requiredSkills || []).filter((s) =>
    lower.includes(String(s).toLowerCase())
  );
  const missingKeywords = (requiredSkills || []).filter(
    (s) => !lower.includes(String(s).toLowerCase())
  );

  const genericHits = ATS_KEYWORDS_GENERIC.filter((k) =>
    lower.includes(k)
  ).length;

  const contact = {
    email: text.match(EMAIL_RE)?.[0] || null,
    phone: text.match(PHONE_RE)?.[0] || null,
    urls: Array.from(new Set(text.match(URL_RE) || [])),
  };

  const sectionScore = Math.min(
    25,
    sectionsFound.length * 4
  );

  const atsKeywordScore = Math.min(20, genericHits * 2);

  const roleKeywordScore = requiredSkills?.length
    ? Math.round((foundSkills.length / requiredSkills.length) * 35)
    : 15;

  const lengthScore =
    wordCount < 120
      ? 5
      : wordCount < 250
      ? 12
      : wordCount < 1200
      ? 20
      : 14;

  const resumeScore = Math.min(
    100,
    sectionScore + atsKeywordScore + roleKeywordScore + lengthScore
  );

  const atsScore = Math.min(
    100,
    Math.round(
      atsKeywordScore * 1.5 +
        sectionScore * 1.2 +
        roleKeywordScore * 1.0
    )
  );

  return {
    ok: true,
    resumeScore,
    atsScore,
    foundSkills,
    missingKeywords,
    sectionsFound,
    contact,
    wordCount,
    breakdown: {
      sectionScore,
      atsKeywordScore,
      roleKeywordScore,
      lengthScore,
    },
  };
}
