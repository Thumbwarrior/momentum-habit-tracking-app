import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import "./db/index.js";
import authRoutes from "./routes/auth.js";
import habitsRoutes from "./routes/habits.js";
import entriesRoutes from "./routes/entries.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/entries", entriesRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Momentum" });
});

app.listen(PORT, () => {
  console.log(`Momentum API running on http://localhost:${PORT}`);
});

export default app;
