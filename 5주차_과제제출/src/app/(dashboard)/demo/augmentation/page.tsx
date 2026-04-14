import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AugmentationGrid from "@/components/ai/AugmentationGrid";
import PaidFeatureGate from "@/components/ai/PaidFeatureGate";
import Link from "next/link";

export default async function AugmentationPage() {
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
            이미지 증강 체험
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            이미지를 업로드하면 다양한 Data Augmentation 기법이 적용된 결과를 확인할 수 있습니다.
          </p>

          <div className="mt-8">
            <PaidFeatureGate userId={session.user.id} email={session.user.email ?? ""}>
              <AugmentationGrid />
            </PaidFeatureGate>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">적용된 기법</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="font-medium text-gray-700">RandomFlip</span> — 좌우/상하 반전
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="font-medium text-gray-700">RandomRotation</span> — 회전 변환
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="font-medium text-gray-700">RandomZoom</span> — 확대/축소
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <span className="font-medium text-gray-700">복합 변환</span> — 여러 기법 조합
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
