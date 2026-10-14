import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }) {
    const [dark, setDark] = useState(false);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        window.localStorage.setItem("wl-theme", next ? "dark" : "light");
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={
                dark ? "Switch to light mode" : "Switch to dark mode"
            }
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-line-strong text-ink hover:border-brand transition-colors duration-150 ${className}`}
        >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}