import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-[360px]">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-gray-900"
          >
            NeuroLab
          </Link>
        </div>

        {/* 카드 */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-center text-lg font-semibold text-gray-900">
            로그인
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            계정에 로그인하여 계속하세요
          </p>

          <div className="mt-7 flex justify-center">
            <LoginButton />
          </div>
        </div>

        {/* 하단 링크 */}
        <p className="mt-5 text-center text-xs text-gray-400">
          로그인하면{" "}
          <span className="underline decoration-gray-300 underline-offset-2">
            서비스 이용약관
          </span>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
