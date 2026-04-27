import { Suspense } from "react";
import { QuotePanel } from "../login/QuotePanel";
import { AuthForm } from "../login/AuthForm";

export const metadata = {
  title: "글결 시작하기 — 글결",
};

export default function SignupPage() {
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
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
