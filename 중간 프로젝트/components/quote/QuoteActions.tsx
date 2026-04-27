"use client";

import { useState, useTransition } from "react";
import { GGIcon } from "@/components/shared/GGIcon";

type Props = {
  quoteId: string;
  initialSaved: boolean;
  /** daily_quotes의 글이면 "daily", user_posts의 글이면 "user". 기본 daily. */
  itemType?: "daily" | "user";
};

/**
 * Today 화면의 3등분 액션 row + 인라인 메시지.
 *
 * 디자인 핸드오프 §5.2:
 *   - 간직하기: 잉크 번지듯 페이드 0.8s, 라벨 → "간직됨", 토스트 없음
 *   - 감상 남기기: 우측 사이드 시트 슬라이드인 (다음 페이즈)
 *   - 조용히 보내기: 링크 클립보드 복사, 헤어라인 한 줄 인라인 메시지 (토스트 X)
 */
export function QuoteActions({
  quoteId,
  initialSaved,
  itemType = "daily",
}: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [inlineMsg, setInlineMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSave() {
    start(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_type: itemType, item_id: quoteId }),
        });
        const json = await res.json();
        if (!json.ok) {
          setInlineMsg(json.error?.message ?? "저장에 실패했습니다.");
          return;
        }
        setSaved(json.data.saved);
        setInlineMsg(json.data.saved ? "간직되었어요" : "간직 목록에서 풀었어요");
      } catch {
        setInlineMsg("연결이 잠시 끊겼어요. 다시 시도해 주세요.");
      }
    });
  }

  function onDiary() {
    setInlineMsg("감상 일기는 다음 결에서 펼쳐집니다.");
  }

  function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!navigator?.clipboard) {
      setInlineMsg("이 브라우저에선 자동 복사를 지원하지 않아요.");
      return;
    }
    navigator.clipboard
      .writeText(url)
      .then(() => setInlineMsg("링크가 클립보드에 담겼어요."))
      .catch(() => setInlineMsg("복사에 실패했어요. 다시 시도해 주세요."));
  }

  return (
    <>
      <div
        style={{
          padding: "28px 0",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0,
        }}
      >
        <ActionButton
          onClick={onSave}
          disabled={pending}
          icon={
            <SaveIcon saved={saved} />
          }
          label={saved ? "간직됨" : "간직하기"}
          sub={saved ? "저장 목록에 있어요" : "저장 목록에 담기"}
          accent={saved}
          first
        />
        <ActionButton
          onClick={onDiary}
          icon={<GGIcon name="pen" size={20} color="var(--ink-deep)" />}
          label="감상 남기기"
          sub="나에게만 보이는 일기"
        />
        <ActionButton
          onClick={onShare}
          icon={<GGIcon name="share" size={20} color="var(--ink-deep)" />}
          label="조용히 보내기"
          sub="링크 공유"
        />
      </div>

      {inlineMsg && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--ink-3)",
            textAlign: "center",
          }}
        >
          {inlineMsg}
        </div>
      )}
    </>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  sub,
  accent,
  first,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  sub: string;
  accent?: boolean;
  first?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        border: 0,
        cursor: disabled ? "default" : "pointer",
        padding: "8px",
        textAlign: "left",
        borderLeft: first ? 0 : "1px solid var(--rule)",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        color: "inherit",
        opacity: disabled ? 0.6 : 1,
        transition: "opacity 0.15s ease, color 0.15s ease",
      }}
    >
      {icon}
      <div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            color: accent ? "var(--accent)" : "var(--ink-deep)",
            marginBottom: 2,
            transition: "color 0.4s ease",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}

/**
 * 잉크 번짐 페이드: bookmark(outline) ↔ bookmark-fill(accent) 두 아이콘을
 * 같은 자리에 겹쳐두고 opacity를 0.8s ease-out으로 교차 페이드.
 */
function SaveIcon({ saved }: { saved: boolean }) {
  return (
    <span
      style={{
        position: "relative",
        width: 20,
        height: 20,
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          opacity: saved ? 0 : 1,
          transition: "opacity 0.8s ease-out",
          color: "var(--ink-deep)",
        }}
      >
        <GGIcon name="bookmark" size={20} />
      </span>
      <span
        style={{
          position: "absolute",
          inset: 0,
          opacity: saved ? 1 : 0,
          transition: "opacity 0.8s ease-out",
          color: "var(--accent)",
        }}
      >
        <GGIcon name="bookmark-fill" size={20} color="var(--accent)" />
      </span>
    </span>
  );
}
