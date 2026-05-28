import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowed = new Set([".pdf", ".doc", ".docx"]);

function removeExistingResumesForUser(userId: any) {
  if (userId === "anon") return;
  try {
    const files = fs.readdirSync(uploadDir);
    const prefix = `user${userId}_`;
    for (const f of files) {
      if (f.startsWith(prefix)) {
        try {
          fs.unlinkSync(path.join(uploadDir, f));
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* directory missing */
  }
}

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const userId = req.user?.id ?? "anon";
    const ext = path.extname(file.originalname).toLowerCase();
    removeExistingResumesForUser(userId);
    cb(null, `user${userId}_resume${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.has(ext)) {
    return cb(
      new Error("Only PDF, DOC, or DOCX files are allowed"),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export default upload;
