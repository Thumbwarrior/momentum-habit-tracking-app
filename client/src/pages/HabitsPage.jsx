import { useEffect, useState } from "react";
import { habits as habitsApi, entries as entriesApi } from "../lib/api";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [targetPerWeek, setTargetPerWeek] = useState(7);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [{ habits: h }, { entries: e }] = await Promise.all([
        habitsApi.list(),
        entriesApi.list({ from: todayIso(), to: todayIso() }),
      ]);
      setHabits(h);
      setEntries(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await habitsApi.create({ name: name.trim(), targetPerWeek: Number(targetPerWeek) });
      setName("");
      setTargetPerWeek(7);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleToday(habitId) {
    const existing = entries.find((en) => en.habitId === habitId && en.date === todayIso());
    const completed = !(existing?.completed);
    try {
      if (existing) {
        await entriesApi.update(existing.id, { completed, notes: existing.notes });
      } else {
        await entriesApi.create({ habitId, date: todayIso(), completed });
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this habit and all its entries?")) return;
    try {
      await habitsApi.remove(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function isDoneToday(habitId) {
    return entries.some((e) => e.habitId === habitId && e.date === todayIso() && e.completed);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Habits</h1>
        <p className="mt-1 text-slate-400">Check in for today and manage your routines</p>
      </div>
      {error && <div className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{error}</div>}
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit name"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
        />
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Target / week
          <input
            type="number"
            min={1}
            max={7}
            value={targetPerWeek}
            onChange={(e) => setTargetPerWeek(e.target.value)}
            className="w-16 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-white"
          />
        </label>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Add habit
        </button>
      </form>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : habits.length === 0 ? (
        <p className="text-slate-500">No habits yet — add one above.</p>
      ) : (
        <ul className="space-y-3">
          {habits.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: h.color }} />
                <div>
                  <p className="font-medium text-white">{h.name}</p>
                  <p className="text-xs text-slate-500">Target {h.targetPerWeek} days / week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleToday(h.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    isDoneToday(h.id)
                      ? "bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-600/50"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isDoneToday(h.id) ? "Done today" : "Mark today"}
                </button>
                <button type="button" onClick={() => handleDelete(h.id)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
