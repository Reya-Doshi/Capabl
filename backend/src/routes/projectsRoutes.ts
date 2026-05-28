import express from "express";
import protect from "../middleware/authMiddleware.js";
import { listProjects } from "../controllers/projectsController.js";

const router = express.Router();

router.get("/", protect, listProjects);

export default router;
