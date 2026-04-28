"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const SAFE_NEXT = /^\/[a-zA-Z0-9/_\-[\]]*$/;

const EmailSchema = z.string().trim().email("올바른 이메일 형식이 아닙니다.");
const PasswordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.");
const NicknameSchema = z
  .string()
  .trim()
  .min(1, "닉네임을 입력해 주세요.")
  .max(20, "닉네임은 20자 이내입니다.");

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

/**
 * 인증 폼.
 * - 토스트 없음. 에러는 헤어라인 + Mono 11px 인라인 메시지.
 * - 호버는 컬러만 변경. transform 변경 금지.
 */
export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = rawNext && SAFE_NEXT.test(rawNext) ? rawNext : "/today";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const emailParsed = EmailSchema.safeParse(email);
    if (!emailParsed.success) {
      setError(emailParsed.error.issues[0].message);
      return;
    }
    const passParsed = PasswordSchema.safeParse(password);
    if (!passParsed.success) {
      setError(passParsed.error.issues[0].message);
      return;
    }
    let nicknameValue: string | null = null;
    if (mode === "signup") {
      const nick = NicknameSchema.safeParse(nickname);
      if (!nick.success) {
        setError(nick.error.issues[0].message);
        return;
      }
      nicknameValue = nick.data;
    }

    startTransition(async () => {
      const supabase = createClient();

      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: emailParsed.data,
          password: passParsed.data,
        });
        if (err) {
          setError(friendlyError(err.message));
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const { data, error: err } = await supabase.auth.signUp({
        email: emailParsed.data,
        password: passParsed.data,
        options: {
          data: { nickname: nicknameValue },
        },
      });
      if (err) {
        setError(friendlyError(err.message));
        return;
      }
      // Supabase 프로젝트 설정에 따라 이메일 확인이 필요할 수 있음.
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        setInfo("확인 메일을 보냈어요. 메일함을 확인해 주세요.");
      }
    });
  }

  function onGoogle() {
    startTransition(async () => {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          // Google 매번 계정 선택 화면 띄우기
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (err) setError(friendlyError(err.message));
    });
  }

  const isLogin = mode === "login";

  return (
    <section
      style={{
        padding: "56px 64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: 520,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div className="eyebrow accent" style={{ marginBottom: 32 }}>
        {isLogin ? "― 다시 만났네요" : "― 처음 오셨어요"}
      </div>
      <h2
        className="heading"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 46,
          fontWeight: 400,
          lineHeight: 1.2,
          margin: "0 0 56px",
          letterSpacing: "-0.015em",
        }}
      >
        {isLogin ? (
          <>
            조용한 자리에<br />
            오신 걸 환영해요.
          </>
        ) : (
          <>
            조용한 자리에<br />
            머무는 결을 시작해요.
          </>
        )}
      </h2>

      <form onSubmit={onSubmit} noValidate>
        {!isLogin && (
          <div style={{ marginBottom: 24 }}>
            <label
              className="eyebrow faint"
              style={{ display: "block", marginBottom: 8 }}
              htmlFor="nickname"
            >
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              style={inputStyle}
            />
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <label
            className="eyebrow faint"
            style={{ display: "block", marginBottom: 8 }}
            htmlFor="email"
          >
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 36 }}>
          <label
            className="eyebrow faint"
            style={{ display: "block", marginBottom: 8 }}
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, letterSpacing: "0.2em" }}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            border: 0,
            padding: "16px 0",
            width: "100%",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.12em",
            marginBottom: 14,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.6 : 1,
            transition: "opacity 0.15s ease",
          }}
        >
          {pending
            ? "들어가는 중…"
            : isLogin
              ? "글결로 들어가기"
              : "글결 시작하기"}
        </button>

        <button
          type="button"
          onClick={onGoogle}
          disabled={pending}
          style={{
            background: "transparent",
            color: "var(--ink-deep)",
            border: "1px solid var(--rule-strong)",
            padding: "16px 0",
            width: "100%",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.6 : 1,
            transition: "color 0.15s ease, background 0.15s ease",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              background: "var(--bg-3)",
              borderRadius: "50%",
            }}
          />
          Google 계정으로 계속하기
        </button>
      </form>

      {(error || info) && (
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: error ? "var(--accent)" : "var(--ink-3)",
          }}
        >
          {error ?? info}
        </div>
      )}

      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--ink-3)",
        }}
      >
        {isLogin ? (
          <span>
            처음이신가요?{" "}
            <Link
              href={`/signup${rawNext ? `?next=${encodeURIComponent(next)}` : ""}`}
              style={{ color: "var(--ink-deep)", textDecoration: "underline" }}
            >
              글결 시작하기
            </Link>
          </span>
        ) : (
          <span>
            이미 계정이 있나요?{" "}
            <Link
              href={`/login${rawNext ? `?next=${encodeURIComponent(next)}` : ""}`}
              style={{ color: "var(--ink-deep)", textDecoration: "underline" }}
            >
              로그인
            </Link>
          </span>
        )}
        <span style={{ letterSpacing: "0.04em" }}>비밀번호 찾기</span>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderBottom: "1px solid var(--rule-strong)",
  background: "transparent",
  padding: "10px 0",
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  color: "var(--ink-deep)",
  outline: "none",
};

function friendlyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 일치하지 않습니다.";
  if (lower.includes("email not confirmed"))
    return "메일 확인이 아직 끝나지 않았어요. 메일함을 확인해 주세요.";
  if (lower.includes("user already registered"))
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (lower.includes("network"))
    return "네트워크 연결을 다시 확인해 주세요.";
  return msg;
}
