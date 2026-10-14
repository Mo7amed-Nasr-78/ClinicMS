import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { STATS } from "./data";

function StatCard({ label, value, delta, direction, positive, icon: Icon }) {
  const DeltaIcon = direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-ink-faint">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[0.78rem] font-medium ${
            positive ? "text-brand" : "text-accent-strong"
          }`}
        >
          <DeltaIcon size={14} />
          {delta}
        </span>
      </div>
      <div className="font-mono text-[1.7rem] font-medium text-ink mb-1">{value}</div>
      <div className="text-ink-muted text-[0.85rem]">{label}</div>
    </div>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
