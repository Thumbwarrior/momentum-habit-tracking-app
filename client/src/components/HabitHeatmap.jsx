const LEVELS = [
  "bg-slate-800",
  "bg-brand-900/80",
  "bg-brand-700/80",
  "bg-brand-600",
  "bg-brand-500",
];

function levelForCount(count, max) {
  if (!count) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

export default function HabitHeatmap({ dailyTotals = [] }) {
  const max = dailyTotals.reduce((m, d) => Math.max(m, d.count), 0);
  const weeks = [];
  for (let i = 0; i < dailyTotals.length; i += 7) {
    weeks.push(dailyTotals.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} completion(s)`}
                className={`h-3 w-3 rounded-sm ${LEVELS[levelForCount(day.count, max)]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Last 12 weeks — darker squares mean more habits completed that day.</p>
    </div>
  );
}
