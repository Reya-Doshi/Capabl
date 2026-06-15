import express from "express";
import protect from "../middleware/authMiddleware.js";
import { reasoningForRecommendations } from "../controllers/recommendationsController.js";

const router = express.Router();

router.post("/reasoning", protect, reasoningForRecommendations);

export default router;
