"use client";

import { useState } from "react";

interface ProductCardProps {
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  customerEmail: string;
}

export default function ProductCard({
  productId,
  name,
  description,
  price,
  currency,
  customerEmail,
}: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(price / 100);

  const handleCheckout = () => {
    setLoading(true);
    const params = new URLSearchParams({
      products: productId,
      customerEmail: customerEmail,
    });
    window.location.href = `/api/checkout?${params.toString()}`;
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md">
      <div>
        <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-2.5">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums text-gray-900">
            {formattedPrice}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "결제하기"
          )}
        </button>
      </div>
    </div>
  );
}
