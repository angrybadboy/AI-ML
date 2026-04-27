"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick() {
    start(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      style={{
        background: "transparent",
        border: "1px solid var(--rule-strong)",
        color: "var(--ink-2)",
        padding: "12px 24px",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        letterSpacing: "0.1em",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.5 : 1,
        transition: "color 0.15s ease, background 0.15s ease",
      }}
    >
      {pending ? "나가는 중…" : "조용히 나가기"}
    </button>
  );
}
