"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center transition-all duration-200 hover:opacity-80"
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: dark ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
        border: dark ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(99,102,241,0.3)",
        padding: 3,
      }}
    >
      {/* Track icons */}
      <span style={{
        position: "absolute", left: 5, fontSize: 10, opacity: dark ? 0.4 : 0,
        transition: "opacity 0.2s"
      }}>🌙</span>
      <span style={{
        position: "absolute", right: 5, fontSize: 10, opacity: dark ? 0 : 0.7,
        transition: "opacity 0.2s"
      }}>☀️</span>

      {/* Thumb */}
      <span style={{
        display: "block",
        width: 16, height: 16,
        borderRadius: "50%",
        background: dark ? "#F59E0B" : "#6366F1",
        transform: dark ? "translateX(0)" : "translateX(20px)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s",
        boxShadow: dark ? "0 0 8px rgba(245,158,11,0.4)" : "0 0 8px rgba(99,102,241,0.4)",
      }} />
    </button>
  );
}
