import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { customerEmail: session.user.email ?? "" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const succeededPayments = payments.filter((p) => p.status === "succeeded");
  const totalAmount = succeededPayments.reduce((sum, p) => sum + p.amount, 0);

  const fmt = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          {/* 인사 */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900">
              {session.user?.name?.split(" ")[0]}님, 반갑습니다
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              결제 현황을 한눈에 확인하세요.
            </p>
          </div>

          {/* 요약 카드 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                결제 건수
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                {succeededPayments.length}
                <span className="ml-0.5 text-sm font-normal text-gray-400">건</span>
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                총 결제액
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                {totalAmount > 0
                  ? fmt(totalAmount, succeededPayments[0]?.currency ?? "usd")
                  : "$0.00"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                계정
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-gray-700">활성</span>
              </div>
            </div>
          </div>

          {/* 결제 내역 */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">결제 내역</h2>
              <Link
                href="/products"
                className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-700"
              >
                새 결제 →
              </Link>
            </div>

            {payments.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${
                          payment.status === "succeeded"
                            ? "bg-green-50 text-green-600"
                            : payment.status === "pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {payment.status === "succeeded" ? "✓" : payment.status === "pending" ? "…" : "✕"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.productName || "상품"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-gray-900">
                        {fmt(payment.amount, payment.currency)}
                      </p>
                      <p
                        className={`text-xs ${
                          payment.status === "succeeded"
                            ? "text-green-600"
                            : payment.status === "pending"
                              ? "text-amber-500"
                              : "text-red-500"
                        }`}
                      >
                        {payment.status === "succeeded"
                          ? "완료"
                          : payment.status === "pending"
                            ? "대기"
                            : "실패"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-gray-400">아직 결제 내역이 없습니다</p>
                <Link
                  href="/products"
                  className="mt-2 text-sm font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                >
                  첫 결제하러 가기
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
