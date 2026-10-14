import { WEEK_OVERVIEW } from "./data";

export function WeeklyOverview() {
  const max = Math.max(...WEEK_OVERVIEW.map((d) => d.value));

  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[1rem] font-semibold text-ink">This week&apos;s appointments</h2>
        <span className="font-mono text-[0.78rem] text-ink-faint">111 total</span>
      </div>
      <div className="flex items-end justify-between gap-3 h-40">
        {WEEK_OVERVIEW.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
            <span className={`text-[0.75rem] font-mono ${d.today ? "text-brand-deep font-medium" : "text-ink-faint"}`}>
              {d.value}
            </span>
            <div className="w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-md transition-[height] duration-500 ${
                  d.today ? "bg-brand" : "bg-surface-2"
                }`}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className={`text-[0.78rem] ${d.today ? "text-ink font-medium" : "text-ink-faint"}`}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
