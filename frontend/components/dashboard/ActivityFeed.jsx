import { ACTIVITY } from "./data";

export function ActivityFeed() {
  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <h2 className="text-[1rem] font-semibold text-ink mb-4">Recent activity</h2>
      <ul className="flex flex-col gap-4">
        {ACTIVITY.map((item, i) => {
          const Icon = item.icon;
          return (
            <li key={i} className="flex gap-3">
              <span className="w-8 h-8 rounded-full bg-surface-2 text-brand flex items-center justify-center shrink-0">
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.85rem] text-ink leading-[1.45]">{item.text}</p>
                <p className="text-[0.76rem] text-ink-faint mt-0.5">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
