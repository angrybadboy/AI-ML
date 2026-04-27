"use client";

import { motion } from "framer-motion";

type Props = {
  paragraphs: string[];
};

/**
 * QuoteView 본문 — 문단 단위 등장.
 * 첫 화면(viewport 안)은 즉시 페이드인.
 * 스크롤로 들어오는 문단은 whileInView 로 한 번만 등장.
 */
export function StaggeredParagraphs({ paragraphs }: Props) {
  return (
    <>
      {paragraphs.map((line, i) => (
        <motion.p
          key={i}
          className={i === 0 ? "heading gg-quote-body" : "gg-quote-body"}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 21,
            lineHeight: 1.95,
            margin: "0 0 32px",
            textIndent: i === 0 ? 0 : "2em",
          }}
        >
          {line}
        </motion.p>
      ))}
    </>
  );
}
