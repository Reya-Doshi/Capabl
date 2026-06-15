import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import whatifRoutes from "./routes/whatifRoutes.js";
import goalsRoutes from "./routes/goalsRoutes.js";
import recommendationsRoutes from "./routes/recommendationsRoutes.js";
import passport from "./config/passport.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(passport.initialize());
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.get("/", (req: any, res: any) => {
  res.send("Capabl API Running");
});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/analysis", analysisRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/interviews", interviewRoutes);

app.use("/api/projects", projectsRoutes);

app.use("/api/whatif", whatifRoutes);

app.use("/api/goals", goalsRoutes);

app.use("/api/recommendations", recommendationsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
