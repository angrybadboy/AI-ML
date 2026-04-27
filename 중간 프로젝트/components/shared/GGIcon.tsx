import type { CSSProperties } from "react";

export type GGIconName =
  | "bookmark"
  | "bookmark-fill"
  | "heart"
  | "share"
  | "pen"
  | "search"
  | "arrow-right"
  | "arrow-down"
  | "arrow-up"
  | "moon"
  | "sun"
  | "plus";

type Props = {
  name: GGIconName;
  size?: number;
  stroke?: number;
  color?: string;
  style?: CSSProperties;
};

export function GGIcon({
  name,
  size = 16,
  stroke = 1.25,
  color = "currentColor",
  style,
}: Props) {
  const s: CSSProperties = { width: size, height: size, ...style };
  const common = {
    style: s,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: stroke,
    "aria-hidden": true,
  };

  switch (name) {
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-6-4-6 4V3z" />
        </svg>
      );
    case "bookmark-fill":
      return (
        <svg {...common} fill={color}>
          <path d="M6 3h12v18l-6-4-6 4V3z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.5-9.5-9C.7 7.5 3 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19 4 21.3 7.5 21.5 11c-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <path d="M4 12v7h16v-7M12 3v13M7 8l5-5 5 5" />
        </svg>
      );
    case "pen":
      return (
        <svg {...common}>
          <path d="M3 21l3-1 12-12-2-2L4 18l-1 3z" />
          <path d="M14 6l4 4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4-4" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...common}>
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...common}>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14A8 8 0 1110 4a7 7 0 0010 10z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
  }
}
