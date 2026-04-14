import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

// 무료 체험 기간: 2026-04-21까지
const FREE_TRIAL_END = new Date("2026-04-21T23:59:59");
const isFreeTrial = new Date() < FREE_TRIAL_END;

const features = [
  {
    href: "/demo/handwriting",
    title: "손글씨 인식기",
    description: "캔버스에 숫자를 그리면 CNN이 실시간 인식",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    tag: "CNN",
    paid: true,
  },
  {
    href: "/demo/augmentation",
    title: "이미지 증강 체험",
    description: "이미지 업로드 → 9가지 변환 결과 확인",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    tag: "Data Augmentation",
    paid: true,
  },
  {
    href: "/demo/training",
    title: "학습 시각화 대시보드",
    description: "Regularization & Overfitting 비교 그래프",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    tag: "Visualization",
    paid: false,
  },
];

export default async function DemoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-xl font-semibold text-gray-900">AI 체험</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            딥러닝 5주차 핵심 개념을 직접 체험해 보세요.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                      {f.icon}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        f.paid && !isFreeTrial
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {f.paid ? (isFreeTrial ? "무료 체험 중" : "유료") : "무료"}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{f.description}</p>
                </div>
                <div className="mt-4">
                  <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                    {f.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
