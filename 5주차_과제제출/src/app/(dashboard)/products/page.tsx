import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/payment/ProductCard";
import { polar } from "@/lib/polar";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let product = null;
  try {
    product = await polar.products.get({
      id: process.env.POLAR_PRODUCT_ID!,
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900">상품</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              원하는 상품을 선택하고 결제하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product ? (
              <ProductCard
                productId={product.id}
                name={product.name}
                description={product.description ?? ""}
                price={
                  product.prices[0]?.amountType === "fixed"
                    ? (product.prices[0] as { priceAmount: number }).priceAmount
                    : 0
                }
                currency={
                  product.prices[0]?.amountType === "fixed"
                    ? (product.prices[0] as { priceCurrency: string }).priceCurrency
                    : "usd"
                }
                customerEmail={session.user?.email ?? ""}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-gray-400">
                  상품을 불러올 수 없습니다
                </p>
                <p className="mt-1 text-xs text-gray-300">
                  Polar 대시보드에서 상품이 생성되어 있는지 확인하세요
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
