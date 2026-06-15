import express from "express";
import protect from "../middleware/authMiddleware.js";
import { commitGoal } from "../controllers/whatifController.js";

const router = express.Router();

router.post("/commit", protect, commitGoal);

export default router;
