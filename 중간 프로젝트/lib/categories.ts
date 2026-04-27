/**
 * 글결의 6개 결(카테고리). 디자인 핸드오프 §6의 Post 타입과 일치.
 * daily_quotes / user_posts 양쪽 DB CHECK 제약과 동기화.
 */
export const CATEGORIES = [
  "고요",
  "위로",
  "사랑",
  "용기",
  "그리움",
  "사색",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" && (CATEGORIES as readonly string[]).includes(value)
  );
}
