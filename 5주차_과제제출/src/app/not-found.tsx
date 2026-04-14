import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <p className="mt-3 text-sm text-gray-500">
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
