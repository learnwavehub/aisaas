"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "purple", label: "Purple" },
  { id: "yellow", label: "Yellow" },
  { id: "green", label: "Green" },
  { id: "red", label: "Red" },
  { id: "pink", label: "Pink" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const saved = localStorage.getItem("sw_theme") || "light";
    apply(saved);
  }, []);

  function apply(name: string) {
    setTheme(name);
    localStorage.setItem("sw_theme", name);
    // set only data-theme attribute; do not toggle a separate dark class
    document.documentElement.setAttribute("data-theme", name);
  }

  return (
    <div className="flex items-center gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => apply(t.id)}
          aria-pressed={theme === t.id}
          className={"h-8 w-8 rounded-full border flex items-center justify-center " + (theme === t.id ? "ring-2 ring-offset-2" : "")}
          title={t.label}
        >
          <span className="sr-only">{t.label}</span>
          <span className={`h-4 w-4 rounded-full ${t.id === "purple" ? "bg-purple-500" : t.id === "yellow" ? "bg-yellow-500" : t.id === "green" ? "bg-emerald-500" : t.id === "red" ? "bg-red-500" : t.id === "pink" ? "bg-pink-500" : t.id === "dark" ? "bg-zinc-800" : "bg-white border"}`}></span>
        </button>
      ))}
    </div>
  );
}
