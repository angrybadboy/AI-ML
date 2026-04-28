import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getFeedPosts } from "@/lib/feed";
import { getMySavedItems } from "@/lib/profile";
import { getMyPaymentHistory, type PaymentLog } from "@/lib/billing";
import { ProfileTabs, type ProfileTab } from "@/components/profile/ProfileTabs";
import { CancelButton } from "@/components/payment/CancelButton";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "마이 — 글결",
};

type SP = Promise<{ tab?: string }>;

function parseTab(tab: string | undefined): ProfileTab {
  if (tab === "written" || tab === "diary") return tab;
  return "saved";
}

export default async function MePage({ searchParams }: { searchParams: SP }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  const supabase = await createClient();
  const [profileRes, savedCountRes, writtenCountRes, paymentHistory] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, created_at, subscription_status, subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("user_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    getMyPaymentHistory(user.id, 5),
  ]);

  const nickname = profileRes.data?.nickname ?? user.email?.split("@")[0] ?? "글결 회원";
  const sinceISO = (profileRes.data?.created_at ?? user.created_at).slice(0, 10);
  const since = sinceISO.replaceAll("-", " · ");
  const expiresAt = profileRes.data?.subscription_expires_at ?? null;
  const isPremium =
    profileRes.data?.subscription_status === "premium" &&
    expiresAt !== null &&
    new Date(expiresAt) > new Date();
  const savedCount = savedCountRes.count ?? 0;
  const writtenCount = writtenCountRes.count ?? 0;
  const diaryCount = 0; // Phase 4+ 구현 예정

  return (
    <main
      className="gg-page-main"
      style={{ padding: "72px 56px 0", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* 상단 — 프로필 카드 + 4-stat */}
      <section
        className="gg-grid-4fr-8fr"
        style={{
          display: "grid",
          gridTemplateColumns: "4fr 8fr",
          gap: 64,
          paddingBottom: 64,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div>
          <div
            style={{
              width: 148,
              height: 148,
              borderRadius: "50%",
              background: "var(--bg-3)",
              border: "1px solid var(--rule-strong)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontSize: 60,
              color: "var(--ink-deep)",
              fontWeight: 300,
              marginBottom: 24,
            }}
          >
            {nickname[0]}
          </div>
          <div className="eyebrow accent" style={{ marginBottom: 6 }}>
            ― 글결 회원
          </div>
          <h1
            className="heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 42,
              fontWeight: 400,
              margin: "0 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            {nickname}
          </h1>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              marginBottom: 24,
              letterSpacing: "0.12em",
            }}
          >
            SINCE {since}
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 15,
              color: "var(--ink-2)",
              lineHeight: 1.7,
              maxWidth: 280,
              margin: 0,
            }}
          >
            조용한 시간에 천천히 읽고 가끔 씁니다.
          </p>
          <div style={{ marginTop: 32 }}>
            <SignOutButton />
          </div>
        </div>

        <div>
          {/* 4-stat */}
          <div
            className="gg-grid-4col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              background: "var(--rule)",
              border: "1px solid var(--rule)",
            }}
          >
            <Stat label="간직한 글" value={savedCount.toLocaleString("ko-KR")} />
            <Stat label="쓴 글결" value={writtenCount.toLocaleString("ko-KR")} />
            <Stat label="연속 읽기" value="—" />
            <Stat label="멤버십" value={isPremium ? "프리미엄" : "무료"} />
          </div>

          <ProfileTabs
            active={tab}
            counts={{
              saved: savedCount,
              written: writtenCount,
              diary: diaryCount,
            }}
          />
        </div>
      </section>

      {/* 멤버십 섹션 */}
      <MembershipSection
        isPremium={isPremium}
        expiresAt={expiresAt}
        history={paymentHistory}
      />

      {/* 탭 본문 */}
      <section style={{ padding: "48px 0" }}>
        {tab === "saved" && <SavedTab userId={user.id} />}
        {tab === "written" && <WrittenTab userId={user.id} />}
        {tab === "diary" && <DiaryPlaceholder />}
      </section>
    </main>
  );
}

function MembershipSection({
  isPremium,
  expiresAt,
  history,
}: {
  isPremium: boolean;
  expiresAt: string | null;
  history: PaymentLog[];
}) {
  return (
    <section
      style={{
        padding: "64px 0",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div
        className="eyebrow accent"
        style={{ marginBottom: 24 }}
      >
        ― 멤버십
      </div>
      <h2
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 36,
          fontWeight: 400,
          margin: "0 0 24px",
          letterSpacing: "-0.015em",
        }}
      >
        {isPremium ? "프리미엄 회원이세요." : "지금은 무료 회원이에요."}
      </h2>

      {isPremium ? (
        <PremiumBlock expiresAt={expiresAt} history={history} />
      ) : (
        <FreeBlock history={history} />
      )}
    </section>
  );
}

function PremiumBlock({
  expiresAt,
  history,
}: {
  expiresAt: string | null;
  history: PaymentLog[];
}) {
  const expiresLabel = expiresAt
    ? new Date(expiresAt).toISOString().slice(0, 10).replaceAll("-", " · ")
    : null;
  const approvedHistory = history.filter((h) => h.status === "approved").slice(0, 3);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
      }}
      className="gg-grid-2col"
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--ink-2)",
            lineHeight: 1.85,
            margin: "0 0 16px",
            maxWidth: 420,
          }}
        >
          {expiresLabel
            ? `${expiresLabel} 까지 함께합니다.`
            : "구독이 활성화되어 있어요."}
          <br />
          언제든 가만히 떠나실 수 있어요.
        </p>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.12em",
            marginBottom: 24,
          }}
        >
          ― 샌드박스 결제 — 실제 청구는 일어나지 않습니다
        </div>
        <CancelButton />
      </div>

      <div>
        <div
          className="eyebrow faint"
          style={{ marginBottom: 16 }}
        >
          ― 최근 결제 내역
        </div>
        {approvedHistory.length === 0 ? (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.12em",
            }}
          >
            (아직 승인된 결제가 없어요)
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              borderTop: "1px solid var(--rule)",
            }}
          >
            {approvedHistory.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--ink-2)",
                }}
              >
                <span>
                  ₩{p.amount.toLocaleString("ko-KR")}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink-3)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {new Date(p.created_at)
                    .toISOString()
                    .slice(0, 10)
                    .replaceAll("-", " · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FreeBlock({ history }: { history: PaymentLog[] }) {
  const failedOrCanceled = history.filter(
    (h) => h.status === "failed" || h.status === "canceled"
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
      }}
      className="gg-grid-2col"
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 17,
            color: "var(--ink-2)",
            lineHeight: 1.85,
            margin: "0 0 24px",
            maxWidth: 420,
          }}
        >
          하루 한 편을 넘는 결을 펼치고 싶다면 프리미엄으로 함께해요.
          한 달 ₩4,900, 언제든 떠나실 수 있어요.
        </p>
        <Link
          href="/premium"
          style={{
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            border: 0,
            padding: "14px 28px",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.12em",
            textDecoration: "none",
            display: "inline-block",
            transition: "opacity 0.15s ease",
          }}
        >
          프리미엄 시작하기 →
        </Link>
      </div>

      {failedOrCanceled.length > 0 && (
        <div>
          <div
            className="eyebrow faint"
            style={{ marginBottom: 16 }}
          >
            ― 지난 결제 흔적
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              borderTop: "1px solid var(--rule)",
            }}
          >
            {failedOrCanceled.slice(0, 3).map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--ink-3)",
                }}
              >
                <span>
                  ₩{p.amount.toLocaleString("ko-KR")} ·{" "}
                  {p.status === "canceled" ? "취소" : "미승인"}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                  }}
                >
                  {new Date(p.created_at)
                    .toISOString()
                    .slice(0, 10)
                    .replaceAll("-", " · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "28px 24px", background: "var(--bg)" }}>
      <div className="eyebrow faint" style={{ marginBottom: 12 }}>
        ― {label}
      </div>
      <div
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 36,
          letterSpacing: "-0.01em",
          fontWeight: 400,
        }}
      >
        {value}
      </div>
    </div>
  );
}

async function SavedTab({ userId }: { userId: string }) {
  const items = await getMySavedItems(userId, 30);
  if (items.length === 0) {
    return (
      <EmptyState message="아직 간직한 글이 없어요. /today 에서 첫 글을 가만히 담아보세요." />
    );
  }
  return (
    <div
      className="gg-grid-3col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 1,
        background: "var(--rule)",
        border: "1px solid var(--rule)",
      }}
    >
      {items.map((it) => (
        <article key={it.saved_id} style={{ padding: "32px", background: "var(--bg)", minHeight: 200 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span className="eyebrow faint">No. {String(it.serial_no).padStart(3, "0")}</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-3)",
                letterSpacing: "0.06em",
              }}
            >
              {it.item_type === "daily" ? "글결" : "사용자"}
            </span>
          </div>
          <div className="eyebrow accent" style={{ marginBottom: 12 }}>
            ― {it.category}
          </div>
          <h3
            className="heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 14px",
              letterSpacing: "-0.01em",
              lineHeight: 1.35,
            }}
          >
            <Link
              href={it.href}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {it.title}
            </Link>
          </h3>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
            }}
          >
            {it.author_label} · {formatDate(it.saved_at)}에 간직함
          </div>
        </article>
      ))}
    </div>
  );
}

async function WrittenTab({ userId }: { userId: string }) {
  const { posts } = await getFeedPosts({ userId, scope: "me", limit: 30 });
  if (posts.length === 0) {
    return (
      <EmptyState
        message="아직 쓴 글결이 없어요."
        action={{ href: "/write", label: "첫 글결 쓰기" }}
      />
    );
  }
  return (
    <div
      className="gg-grid-3col"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 1,
        background: "var(--rule)",
        border: "1px solid var(--rule)",
      }}
    >
      {posts.map((p) => (
        <article key={p.id} style={{ padding: "32px", background: "var(--bg)", minHeight: 200 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span className="eyebrow faint">No. {String(p.serial_no).padStart(3, "0")}</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: p.visibility === "public" ? "var(--accent)" : "var(--ink-3)",
                letterSpacing: "0.06em",
              }}
            >
              {p.visibility === "public" ? "공개" : "비공개"}
            </span>
          </div>
          <div className="eyebrow accent" style={{ marginBottom: 12 }}>
            ― {p.category}
          </div>
          <h3
            className="heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 14px",
              letterSpacing: "-0.01em",
              lineHeight: 1.35,
            }}
          >
            <Link
              href={`/p/${p.serial_no}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {p.title}
            </Link>
          </h3>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
            }}
          >
            {formatDate(p.created_at)}에 쓴 글
          </div>
        </article>
      ))}
    </div>
  );
}

function DiaryPlaceholder() {
  return (
    <EmptyState
      message="감상 일기 기능은 다음 결에서 펼쳐집니다."
    />
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div
      style={{
        padding: "120px 0",
        textAlign: "center",
        fontFamily: "var(--font-serif)",
        fontSize: 18,
        color: "var(--ink-3)",
        lineHeight: 1.7,
      }}
    >
      {message}
      {action && (
        <div style={{ marginTop: 32 }}>
          <Link
            href={action.href}
            style={{
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              border: 0,
              padding: "14px 32px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              letterSpacing: "0.12em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}월 ${day}일`;
}
