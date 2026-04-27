"use client";

import { usePathname } from "next/navigation";
import { FadeInPage } from "./FadeInPage";
import type { ReactNode } from "react";

/**
 * 라우트 변경마다 페이드인 트리거.
 * pathname을 key로 주어 children을 새로 마운트시킨다.
 * (app)/layout.tsx, (auth)/layout.tsx 등에서 사용.
 */
export function FadeInOnRouteChange({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <FadeInPage key={pathname ?? "root"}>{children}</FadeInPage>;
}
