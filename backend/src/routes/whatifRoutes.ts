import express from "express";
import protect from "../middleware/authMiddleware.js";
import { simulate } from "../controllers/whatifController.js";

const router = express.Router();

router.post("/simulate", protect, simulate);

export default router;
