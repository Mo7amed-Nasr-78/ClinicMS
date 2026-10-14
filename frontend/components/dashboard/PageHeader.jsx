import { Plus } from "lucide-react";
import { CURRENT_USER } from "./data";

export function PageHeader() {
  return (
    <div className="flex justify-between gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.6rem,2.5vw,2rem)] text-ink mb-1">
          Good morning, {CURRENT_USER.name}
        </h1>
        <p className="text-ink-muted text-[0.92rem]">Tuesday, August 11 — 12 appointments on today&apos;s schedule.</p>
      </div>
      <button className="inline-flex items-center justify-center gap-2 bg-brand text-chip font-medium text-[0.88rem] px-5 py-2.5 rounded-full hover:bg-brand-deep transition-colors duration-150 active:translate-y-px w-fit">
        <Plus size={16} />
        New appointment
      </button>
    </div>
  );
}
