import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import {
  RegularizationChart,
  OverfittingLossChart,
  PredictionChart,
} from "@/components/ai/TrainingChart";
import Link from "next/link";

export default async function TrainingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/demo"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← AI 체험
          </Link>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            학습 시각화 대시보드
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            딥러닝 모델의 Regularization과 Overfitting/Underfitting을 시각적으로 비교합니다.
          </p>

          <div className="mt-8 space-y-8">
            {/* Regularization 비교 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <RegularizationChart />
            </div>

            {/* Overfitting 손실 곡선 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <OverfittingLossChart />
            </div>

            {/* 예측 곡선 비교 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <PredictionChart />
            </div>

            {/* 개념 설명 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">핵심 개념 요약</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">Regularization</p>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    L2는 가중치를 작게, Dropout은 뉴런을 무작위 비활성화,
                    BatchNorm은 층 입력을 정규화하여 과적합을 방지합니다.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">Overfitting vs Underfitting</p>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    모델이 너무 단순하면 Underfitting, 너무 복잡하면 Overfitting.
                    적절한 복잡도의 모델이 일반화 성능이 가장 좋습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
