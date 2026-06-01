import express from "express";

import { getJobMatch } from "../controllers/jobMatchController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, getJobMatch);

export default router;
