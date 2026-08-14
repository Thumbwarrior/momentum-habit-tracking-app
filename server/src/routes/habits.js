import { Router } from "express";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const listHabits = db.prepare(
  "SELECT id, name, description, color, target_per_week AS targetPerWeek, created_at AS createdAt FROM habits WHERE user_id = ? ORDER BY created_at DESC"
);
const getHabit = db.prepare(
  "SELECT id, name, description, color, target_per_week AS targetPerWeek, created_at AS createdAt FROM habits WHERE id = ? AND user_id = ?"
);
const insertHabit = db.prepare(
  "INSERT INTO habits (user_id, name, description, color, target_per_week) VALUES (?, ?, ?, ?, ?)"
);
const updateHabit = db.prepare(
  "UPDATE habits SET name = ?, description = ?, color = ?, target_per_week = ? WHERE id = ? AND user_id = ?"
);
const deleteHabit = db.prepare("DELETE FROM habits WHERE id = ? AND user_id = ?");

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

router.get("/dashboard", (req, res) => {
  const userId = req.user.id;
  const habits = listHabits.all(userId);
  const from = daysAgo(84);
  const to = isoDate();

  const entryRows = db
    .prepare(
      `SELECT e.entry_date AS date, e.completed, h.id AS habitId, h.name, h.color
       FROM entries e
       JOIN habits h ON h.id = e.habit_id
       WHERE h.user_id = ? AND e.entry_date BETWEEN ? AND ?`
    )
    .all(userId, from, to);

  const byDate = {};
  for (const row of entryRows) {
    if (!row.completed) continue;
    byDate[row.date] = (byDate[row.date] || 0) + 1;
  }

  const dailyTotals = [];
  for (let i = 83; i >= 0; i--) {
    const date = daysAgo(i);
    dailyTotals.push({ date, count: byDate[date] || 0 });
  }

  const weekStart = daysAgo(6);
  const weeklyByHabit = db
    .prepare(
      `SELECT h.id, h.name, h.color, h.target_per_week AS targetPerWeek,
              SUM(CASE WHEN e.completed = 1 THEN 1 ELSE 0 END) AS completed
       FROM habits h
       LEFT JOIN entries e ON e.habit_id = h.id AND e.entry_date BETWEEN ? AND ?
       WHERE h.user_id = ?
       GROUP BY h.id`
    )
    .all(weekStart, to, userId);

  res.json({
    habitCount: habits.length,
    weeklyByHabit,
    dailyTotals,
    heatmap: dailyTotals,
  });
});

router.get("/", (req, res) => {
  res.json({ habits: listHabits.all(req.user.id) });
});

router.post("/", (req, res) => {
  const { name, description = "", color = "#9333ea", targetPerWeek = 7 } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
  const target = Number(targetPerWeek);
  if (!Number.isFinite(target) || target < 1 || target > 7) {
    return res.status(400).json({ error: "targetPerWeek must be between 1 and 7" });
  }
  const result = insertHabit.run(req.user.id, name.trim(), description, color, target);
  const habit = getHabit.get(result.lastInsertRowid, req.user.id);
  res.status(201).json({ habit });
});

router.get("/:id", (req, res) => {
  const habit = getHabit.get(Number(req.params.id), req.user.id);
  if (!habit) return res.status(404).json({ error: "Habit not found" });
  res.json({ habit });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = getHabit.get(id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Habit not found" });
  const { name, description, color, targetPerWeek } = req.body;
  const nextName = name?.trim() || existing.name;
  const nextDesc = description ?? existing.description;
  const nextColor = color ?? existing.color;
  const nextTarget = targetPerWeek ?? existing.targetPerWeek;
  updateHabit.run(nextName, nextDesc, nextColor, nextTarget, id, req.user.id);
  res.json({ habit: getHabit.get(id, req.user.id) });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = deleteHabit.run(id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Habit not found" });
  res.json({ message: "Habit deleted" });
});

export default router;
