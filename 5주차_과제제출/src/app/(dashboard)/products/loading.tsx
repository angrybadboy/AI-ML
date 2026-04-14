export default function ProductsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="mt-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="h-7 w-20 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
