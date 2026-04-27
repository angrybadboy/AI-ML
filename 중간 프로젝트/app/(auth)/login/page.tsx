import { Suspense } from "react";
import { QuotePanel } from "./QuotePanel";
import { AuthForm } from "./AuthForm";

export const metadata = {
  title: "로그인 — 글결",
};

export default function LoginPage() {
  return (
    <div
      className="skin fog gg-auth-split"
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <QuotePanel />
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
