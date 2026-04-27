"use client";

import { useMemo } from "react";

type Props = {
  count?: number;
  w?: number;
  h?: number;
  opacity?: number;
};

/**
 * Mulberry32 — 결정적 PRNG. seed가 같으면 항상 같은 시퀀스.
 * Math.random은 React 순수성 규칙(react-hooks/purity)에 걸리므로
 * count·w·h를 합친 seed로 안정적인 별 배치를 만든다.
 */
function makePrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 다크 모드용 별 배경.
 * 라이트 모드에선 `--is-dark: 0`으로 opacity가 0이 되어 자동 hidden.
 */
export function GGStars({ count = 60, w = 1440, h = 400, opacity = 1 }: Props) {
  const stars = useMemo(() => {
    const rand = makePrng(count * 9301 + w * 49297 + h * 233);
    return Array.from({ length: count }, () => ({
      cx: (rand() * w).toFixed(1),
      cy: (rand() * h).toFixed(1),
      r: (0.3 + rand() * 1.2).toFixed(2),
      o: (0.15 + rand() * 0.55).toFixed(2),
    }));
  }, [count, w, h]);

  return (
    <svg
      width={w}
      height={h}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: `calc(var(--is-dark) * ${opacity})`,
      }}
      aria-hidden
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="var(--ink-deep)"
          opacity={s.o}
        />
      ))}
    </svg>
  );
}
