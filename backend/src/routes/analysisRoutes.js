import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAnalysis,
  refreshAnalysis,
} from "../controllers/analysisController.js";

const router = express.Router();

router.get("/", protect, getAnalysis);
router.post("/", protect, refreshAnalysis);

export default router;
