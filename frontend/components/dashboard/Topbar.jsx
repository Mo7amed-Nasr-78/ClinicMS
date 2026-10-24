"use client";

import { Menu, Search, Bell } from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";

export function Topbar({ onMenuClick, title = "" }) {
  return (
    <header className={`sticky top-0 z-30 h-16 border-b border-line bg-bg backdrop-blur-3xl flex items-center justify-between gap-4 py-4`}>
      {title && (
        <h1 className="mt-1 font-serif text-4xl font-normal text-ink capitalize">
          { title }
        </h1>
      ) }

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-2 text-ink-faint hover:text-ink"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search patients, appointments…"
            className="min-w-full w-84 pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-ink text-[0.88rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150"
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-2 ml-auto">
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full text-ink-faint hover:text-ink hover:bg-surface-2 transition-colors duration-150"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-accent" />
          </button>
          <ThemeToggle />
        </div>
      </div>

    </header>
  );
}
