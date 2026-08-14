import { Router } from "express";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const habitOwned = db.prepare("SELECT id FROM habits WHERE id = ? AND user_id = ?");
const listEntries = db.prepare(
  `SELECT e.id, e.habit_id AS habitId, e.entry_date AS date, e.completed, e.notes
   FROM entries e
   JOIN habits h ON h.id = e.habit_id
   WHERE h.user_id = ?`
);
const insertEntry = db.prepare(
  "INSERT INTO entries (habit_id, entry_date, completed, notes) VALUES (?, ?, ?, ?)"
);
const upsertEntry = db.prepare(
  `INSERT INTO entries (habit_id, entry_date, completed, notes) VALUES (?, ?, ?, ?)
   ON CONFLICT(habit_id, entry_date) DO UPDATE SET completed = excluded.completed, notes = excluded.notes`
);
const updateEntry = db.prepare(
  `UPDATE entries SET completed = ?, notes = ?
   WHERE id = ? AND habit_id IN (SELECT id FROM habits WHERE user_id = ?)`
);
const deleteEntry = db.prepare(
  `DELETE FROM entries WHERE id = ? AND habit_id IN (SELECT id FROM habits WHERE user_id = ?)`
);

router.get("/", (req, res) => {
  const { habitId, from, to } = req.query;
  let rows = listEntries.all(req.user.id);
  if (habitId) rows = rows.filter((r) => String(r.habitId) === String(habitId));
  if (from) rows = rows.filter((r) => r.date >= from);
  if (to) rows = rows.filter((r) => r.date <= to);
  res.json({ entries: rows });
});

router.post("/", (req, res) => {
  const { habitId, date, completed = true, notes = "" } = req.body;
  if (!habitId || !date) return res.status(400).json({ error: "habitId and date are required" });
  if (!habitOwned.get(habitId, req.user.id)) return res.status(404).json({ error: "Habit not found" });
  upsertEntry.run(habitId, date, completed ? 1 : 0, notes);
  const entry = db
    .prepare(
      `SELECT e.id, e.habit_id AS habitId, e.entry_date AS date, e.completed, e.notes
       FROM entries e WHERE e.habit_id = ? AND e.entry_date = ?`
    )
    .get(habitId, date);
  res.status(201).json({ entry });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { completed, notes } = req.body;
  const result = updateEntry.run(completed ? 1 : 0, notes ?? "", id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Entry not found" });
  const entry = db
    .prepare("SELECT id, habit_id AS habitId, entry_date AS date, completed, notes FROM entries WHERE id = ?")
    .get(id);
  res.json({ entry });
});

router.delete("/:id", (req, res) => {
  const result = deleteEntry.run(Number(req.params.id), req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: "Entry not found" });
  res.json({ message: "Entry deleted" });
});

export default router;
