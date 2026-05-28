import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  upsertProfile,
  getProfile,
  uploadResume,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", protect, getProfile);

router.post(
  "/",
  protect,
  upload.single("resume"),
  upsertProfile
);

router.post(
  "/resume",
  protect,
  upload.single("resume"),
  uploadResume
);

export default router;
