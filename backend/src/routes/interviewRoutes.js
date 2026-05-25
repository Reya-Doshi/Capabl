import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  listInterviews,
  startInterview,
  submitTurn,
  endVoiceCall,
  finishInterview,
  abandonInterview,
  getInterview,
  dialCandidate,
} from "../controllers/interviewController.js";

const router = express.Router();

// Catalog + list + analytics
router.get("/", protect, listInterviews);

// Session lifecycle (works for both voice and text modes — controller branches)
router.post("/start", protect, startInterview);
router.post("/:id/turn", protect, submitTurn);
router.post("/:id/voice-end", protect, endVoiceCall);
router.post("/:id/finish", protect, finishInterview);
router.post("/:id/abandon", protect, abandonInterview);

// Phone-call seam (Phase 3)
router.post("/dial", protect, dialCandidate);

router.get("/:id", protect, getInterview);

export default router;
