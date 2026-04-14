export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 스켈레톤 */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
                    <div>
                      <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="mt-1.5 h-2.5 w-16 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
