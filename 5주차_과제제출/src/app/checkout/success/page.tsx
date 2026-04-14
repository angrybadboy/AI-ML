import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-[360px] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <svg
            className="h-7 w-7 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-xl font-semibold text-gray-900">
          결제가 완료되었습니다
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          주문이 성공적으로 처리되었습니다.
          <br />
          이용해 주셔서 감사합니다.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="flex h-10 items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            대시보드에서 확인하기
          </Link>
          <Link
            href="/products"
            className="flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            다른 상품 보기
          </Link>
        </div>
      </div>

      <p className="mt-12 text-xs text-gray-300">
        <Link href="/" className="hover:text-gray-400">
          NeuroLab
        </Link>
      </p>
    </div>
  );
}
