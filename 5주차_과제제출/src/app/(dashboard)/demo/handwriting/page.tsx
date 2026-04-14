import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HandwritingCanvas from "@/components/ai/HandwritingCanvas";
import PaidFeatureGate from "@/components/ai/PaidFeatureGate";
import Link from "next/link";

export default async function HandwritingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/demo"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← AI 체험
          </Link>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            손글씨 숫자 인식기
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            캔버스에 0~9 숫자를 그리면 CNN 모델이 실시간으로 인식합니다.
          </p>

          <div className="mt-8">
            <PaidFeatureGate userId={session.user.id} email={session.user.email ?? ""}>
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <HandwritingCanvas />
              </div>
            </PaidFeatureGate>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">모델 구조 (CNN)</h3>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {[
                "Conv2D(32, 3×3)",
                "→ MaxPool",
                "→ Conv2D(64, 3×3)",
                "→ MaxPool",
                "→ Conv2D(64, 3×3)",
                "→ Flatten",
                "→ Dense(64)",
                "→ Dense(10, softmax)",
              ].map((layer, i) => (
                <span
                  key={i}
                  className="rounded-md bg-gray-100 px-2 py-1 text-gray-600"
                >
                  {layer}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              MNIST 60,000장으로 학습된 CNN 모델이 TensorFlow.js를 통해 브라우저에서 직접 추론합니다.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
