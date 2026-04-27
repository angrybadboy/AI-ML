"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 진입 지연 (ms 아닌 초). 기본 0. */
  delay?: number;
};

/**
 * 페이지 단위 페이드인 — 디자인 핸드오프 §3 Motion 기준.
 * opacity 0→1, translateY 8→0, 0.8s ease-out.
 * 라우트 변경 시마다 새로 마운트되어 자연스럽게 페이드인.
 */
export function FadeInPage({ children, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
