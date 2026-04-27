"use client";

import { useSyncExternalStore } from "react";
import { GGIcon } from "./GGIcon";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "light";
  return (document.documentElement.getAttribute("data-theme") as Theme) ??
    "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("gg-theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      style={{
        background: "transparent",
        border: 0,
        padding: 4,
        cursor: "pointer",
        color: "var(--ink-2)",
        display: "inline-flex",
        alignItems: "center",
        transition: "color 0.15s ease",
      }}
    >
      <GGIcon name={theme === "light" ? "moon" : "sun"} size={16} />
    </button>
  );
}
