import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col">
        {/* 히어로 */}
        <section className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-600">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
              지금 일주일간 모든 기능 무료 체험
            </div>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-5xl">
              딥러닝을
              <br />
              직접 체험하세요
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-gray-500">
              CNN 손글씨 인식, 이미지 증강, 학습 시각화까지.
              <br />
              브라우저에서 바로 실행되는 AI 데모를 만나보세요.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={session ? "/demo" : "/login"}
                className="inline-flex h-11 items-center rounded-lg bg-gray-900 px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.98]"
              >
                {session ? "AI 체험하러 가기" : "Google로 시작하기"}
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center rounded-lg border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  대시보드
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* AI 기능 카드 */}
        <section className="border-t border-gray-200/80 bg-white px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
              체험 가능한 기능
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* 손글씨 인식 */}
              <Link
                href={session ? "/demo/handwriting" : "/login"}
                className="group rounded-xl border border-gray-200 p-5 transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  손글씨 숫자 인식
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  캔버스에 숫자를 그리면 CNN 모델이 실시간으로
                  0~9를 판별합니다.
                </p>
                <span className="mt-3 inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400">
                  CNN · TensorFlow.js
                </span>
              </Link>

              {/* 이미지 증강 */}
              <Link
                href={session ? "/demo/augmentation" : "/login"}
                className="group rounded-xl border border-gray-200 p-5 transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  이미지 증강 체험
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  이미지를 업로드하면 회전, 반전, 확대/축소 등
                  9가지 변환 결과를 확인합니다.
                </p>
                <span className="mt-3 inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400">
                  Data Augmentation
                </span>
              </Link>

              {/* 학습 시각화 */}
              <Link
                href={session ? "/demo/training" : "/login"}
                className="group rounded-xl border border-gray-200 p-5 transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  학습 시각화
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  Regularization과 Overfitting/Underfitting을
                  인터랙티브 그래프로 비교합니다.
                </p>
                <span className="mt-3 inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400">
                  Regularization · Overfitting
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 기술 스택 */}
        <section className="border-t border-gray-200/80 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
              사용된 기술
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400">
              <span>Next.js 16</span>
              <span className="hidden sm:inline">·</span>
              <span>TypeScript</span>
              <span className="hidden sm:inline">·</span>
              <span>TensorFlow.js</span>
              <span className="hidden sm:inline">·</span>
              <span>NextAuth (Google OAuth)</span>
              <span className="hidden sm:inline">·</span>
              <span>Polar.sh</span>
              <span className="hidden sm:inline">·</span>
              <span>PostgreSQL</span>
              <span className="hidden sm:inline">·</span>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
