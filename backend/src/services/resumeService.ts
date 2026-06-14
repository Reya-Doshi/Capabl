import fs from "fs";
import path from "path";

// pdf-parse v2 exports a PDFParse class via the package entry; the old
// subpath import (`pdf-parse/lib/pdf-parse.js`) was removed in v2 and v1's
// default export was a function. Support both so the extractor keeps working
// across versions.
let pdfParseFn: any = null;
async function getPdfParse() {
  if (pdfParseFn) return pdfParseFn;
  try {
    const mod: any = await import("pdf-parse");
    if (typeof mod.default === "function") {
      // v1: default export is `(buffer) => { text }`
      pdfParseFn = async (buf: any) => {
        const r = await mod.default(buf);
        return r?.text || "";
      };
    } else if (mod.PDFParse) {
      // v2: class with instance.getText()
      pdfParseFn = async (buf: any) => {
        const p = new mod.PDFParse({ data: buf });
        const r = await p.getText();
        return r?.text || "";
      };
    }
  } catch {
    pdfParseFn = null;
  }
  return pdfParseFn;
}

// Last-resort fallback when pdf-parse can't load or fails on a specific file.
// Pulls printable ASCII runs (length >= 4) out of the binary so keyword
// matching still has something to chew on, without dumping raw garbage.
function extractPrintableStrings(buf: any) {
  const text = buf.toString("latin1");
  const matches = text.match(/[\x20-\x7E]{4,}/g) || [];
  return matches.join(" ");
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

export const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
export const EMAIL_RE = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
export const URL_RE = /(https?:\/\/[^\s)<>"']+)/gi;

// Domains/path fragments that come from PDF metadata, Adobe tooling, or
// XML/XMP namespaces — never useful to show as a "link in the resume".
const URL_BLOCKLIST = [
  "adobe.com",
  "ns.adobe.com",
  "www.w3.org",
  "purl.org",
  "iptc.org",
  "schema.org",
  "xmlns",
  "docs.oasis-open.org",
  "openoffice.org",
  "microsoft.com/office",
  "office.com",
  "schemas.openxmlformats.org",
  "schemas.microsoft.com",
];

export function isUsefulUrl(u: any) {
  if (!u) return false;
  const lower = u.toLowerCase();
  if (URL_BLOCKLIST.some((b) => lower.includes(b))) return false;
  // Strip trailing punctuation often glued to URLs in PDFs
  return /^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(u);
}

export function cleanUrl(u: any) {
  return u.replace(/[),.;:'"]+$/g, "");
}

// Scheme-less profile URLs that resumes very commonly write without "https://",
// e.g. "github.com/jane", "www.linkedin.com/in/jane". URL_RE (which requires a
// scheme) misses these, so we capture them separately and normalise to a full
// https:// URL. Without this, GitHub/LinkedIn never auto-populate (BUG-010).
export const BARE_URL_RE =
  /\b((?:www\.)?(?:github\.com|linkedin\.com|gitlab\.com|behance\.net|dribbble\.com|medium\.com)\/[^\s)<>"']+)/gi;

// Single source of truth for pulling usable links out of resume text: combines
// scheme-prefixed URLs (URL_RE) with scheme-less profile URLs (BARE_URL_RE),
// normalises and de-duplicates them.
export function extractResumeUrls(text: any): string[] {
  const safe = String(text || "");
  const out = new Set<string>();
  for (const m of safe.match(URL_RE) || []) {
    const u = cleanUrl(m);
    if (isUsefulUrl(u)) out.add(u);
  }
  for (const m of safe.match(BARE_URL_RE) || []) {
    const u = cleanUrl(`https://${String(m).replace(/^www\./i, "")}`);
    if (isUsefulUrl(u)) out.add(u);
  }
  return [...out];
}

// Classify a list of resume URLs into the three optional evidence sources.
// Returns the first match for each; everything that isn't GitHub/LinkedIn is
// treated as a portfolio/personal site.
export function classifyUrls(urls: string[] = []): {
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
} {
  const out: { githubUrl?: string; linkedinUrl?: string; portfolioUrl?: string } = {};
  for (const raw of urls) {
    const u = cleanUrl(String(raw));
    if (!isUsefulUrl(u)) continue;
    const lower = u.toLowerCase();
    if (!out.githubUrl && lower.includes("github.com")) out.githubUrl = u;
    else if (!out.linkedinUrl && lower.includes("linkedin.com")) out.linkedinUrl = u;
    else if (!out.portfolioUrl) out.portfolioUrl = u;
  }
  return out;
}

// Remove PDF/XML metadata noise that pdf-parse sometimes leaves behind.
function cleanResumeText(raw: any) {
  if (!raw) return "";
  return raw
    // strip XML/XMP metadata tags like <x:xmpmeta ...>
    .replace(/<\/?[a-z][a-z0-9:_-]*[^>]*>/gi, " ")
    // strip non-printable control chars (keep \n \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    // collapse whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractResumeText(resumePath: any) {
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
        const text = await parser(buf);
        if (text && text.trim()) return cleanResumeText(text);
      } catch {
        /* fall through to printable-strings fallback */
      }
    }
    return cleanResumeText(extractPrintableStrings(buf));
  }

  // .doc/.docx: pull printable strings out of the binary container.
  return cleanResumeText(extractPrintableStrings(buf));
}

export function analyzeResumeText(text: any, requiredSkills: any) {
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

  const sectionsFound = SECTION_HEADERS.filter((h) => lower.includes(h));

  const foundSkills = (requiredSkills || []).filter((s: any) =>
    lower.includes(String(s).toLowerCase())
  );
  const missingKeywords = (requiredSkills || []).filter(
    (s: any) => !lower.includes(String(s).toLowerCase())
  );

  const genericHits = ATS_KEYWORDS_GENERIC.filter((k) =>
    lower.includes(k)
  ).length;

  const rawUrls = extractResumeUrls(text);

  const contact = {
    email: text.match(EMAIL_RE)?.[0] || null,
    phone: text.match(PHONE_RE)?.[0] || null,
    urls: rawUrls,
  };

  const sectionScore = Math.min(25, sectionsFound.length * 4);
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
      atsKeywordScore * 1.5 + sectionScore * 1.2 + roleKeywordScore * 1.0
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
