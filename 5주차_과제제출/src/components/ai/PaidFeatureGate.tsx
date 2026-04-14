"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 무료 체험 기간: 2026-04-21까지
const FREE_TRIAL_END = new Date("2026-04-21T23:59:59");

interface Props {
  userId: string;
  email: string;
  children: React.ReactNode;
}

export default function PaidFeatureGate({ userId, email, children }: Props) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const isFreeTrial = new Date() < FREE_TRIAL_END;

  useEffect(() => {
    // 무료 체험 기간이면 API 호출 스킵
    if (isFreeTrial) {
      setHasAccess(true);
      return;
    }

    async function check() {
      try {
        const res = await fetch(
          `/api/access?userId=${userId}&email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        setHasAccess(data.hasAccess);
      } catch {
        setHasAccess(false);
      }
    }
    check();
  }, [userId, email, isFreeTrial]);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">
          프리미엄 기능입니다
        </p>
        <p className="mt-1 text-xs text-gray-400">
          무료 체험 기간이 종료되었습니다. 결제 후 이용해 주세요.
        </p>
        <Link
          href="/products"
          className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          결제하고 잠금 해제
        </Link>
      </div>
    );
  }

  return (
    <div>
      {isFreeTrial && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
          <p className="text-xs text-blue-600">
            일주일간 모든 AI 기능을 무료로 체험할 수 있습니다
            <span className="ml-1 text-blue-400">
              (~
              {FREE_TRIAL_END.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}
              까지)
            </span>
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
