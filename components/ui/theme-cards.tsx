"use client";

import React, { useEffect, useState } from "react";

const THEMES = [
  { id: "light", label: "Light", color: "bg-white border" },
  { id: "dark", label: "Dark", color: "bg-zinc-900" },
  { id: "purple", label: "Purple", color: "bg-purple-500" },
  { id: "yellow", label: "Yellow", color: "bg-yellow-400" },
  { id: "green", label: "Green", color: "bg-emerald-500" },
  { id: "red", label: "Red", color: "bg-red-500" },
  { id: "pink", label: "Pink", color: "bg-pink-500" },
];

export default function ThemeCards({ compact, onSelect, close }: { compact?: boolean; onSelect?: () => void; close?: () => void }) {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const saved = localStorage.getItem("sw_theme") || "light";
    apply(saved);
  }, []);

  function apply(name: string) {
    setTheme(name);
    try {
      localStorage.setItem("sw_theme", name);
      document.documentElement.setAttribute("data-theme", name);
    } catch (e) {
      // silent
    }
    // notify parent (close menu)
    try {
      onSelect?.();
    } catch {}
    try {
      close?.();
    } catch {}
  }

  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => apply(t.id)}
          aria-pressed={theme === t.id}
          className={
            (compact
              ? "flex flex-col items-start gap-2 p-3 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none min-w-0 w-full"
              : "flex items-center gap-3 p-3 rounded-xl shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none min-w-[140px]") +
            (theme === t.id ? " ring-2 ring-indigo-400" : "")
          }
        >
          <div className={"h-10 w-10 rounded-full flex-shrink-0 " + t.color} style={{boxShadow: '0 2px 6px rgba(0,0,0,0.08)'}} />
          <div className={compact ? "mt-1 text-left" : "text-left"}>
            <div className="text-sm font-medium">{t.label}</div>
            <div className="text-xs text-zinc-500">{t.id}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
