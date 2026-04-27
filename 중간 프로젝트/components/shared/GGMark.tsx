type Props = {
  size?: number;
  color?: string;
};

export function GGMark({ size = 28, color = "currentColor" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15.25" stroke={color} strokeWidth="0.6" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fontFamily='"Noto Serif KR", serif'
        fontSize="14"
        fontWeight="500"
        fill={color}
        letterSpacing="-0.02em"
      >
        결
      </text>
    </svg>
  );
}
