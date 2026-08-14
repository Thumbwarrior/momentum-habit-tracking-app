import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { habits as habitsApi } from "../lib/api";
import HabitHeatmap from "../components/HabitHeatmap";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    habitsApi.dashboard().then(setStats).catch((e) => setError(e.message));
  }, []);

  const lineData = stats?.dailyTotals?.slice(-14) ?? [];
  const barData = (stats?.weeklyByHabit ?? []).map((h) => ({
    name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name,
    completed: h.completed ?? 0,
    target: h.targetPerWeek ?? 7,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">Your habit momentum at a glance</p>
        </div>
        <Link to="/habits" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Manage habits
        </Link>
      </div>
      {error && <div className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{error}</div>}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-3xl font-bold text-white">{stats?.habitCount ?? "—"}</p>
          <p className="mt-1 text-sm text-slate-400">Active habits</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">This week</p>
          {!stats ? (
            <p className="mt-4 text-slate-500">Loading…</p>
          ) : stats.weeklyByHabit.length === 0 ? (
            <p className="mt-4 text-slate-500">Add a habit to start tracking.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.weeklyByHabit.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{h.name}</span>
                  <span className="text-slate-500">
                    {h.completed}/{h.targetPerWeek} days
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Daily completions (14 days)</h2>
        <div className="h-64">
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={false} name="Completions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500">No data yet.</p>
          )}
        </div>
      </section>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Weekly progress by habit</h2>
        <div className="h-64">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="completed" fill="#9333ea" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500">No habits yet.</p>
          )}
        </div>
      </section>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Activity heatmap</h2>
        {stats?.heatmap ? <HabitHeatmap dailyTotals={stats.heatmap} /> : <p className="text-slate-500">Loading…</p>}
      </section>
    </div>
  );
}
