import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  toggleSkillProgress,
  toggleWeeklyTask,
} from "../controllers/progressController.js";

const router = express.Router();

router.put("/skill", protect, toggleSkillProgress);
router.put("/task", protect, toggleWeeklyTask);

export default router;
