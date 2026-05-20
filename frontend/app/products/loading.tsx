import { Loader2 } from "lucide-react";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Navbar Skeleton */}
      <div className="h-16 bg-white/95 border-b border-border-light" />

      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar Skeleton - Hidden on mobile */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 bg-white border-r border-border-light p-6 space-y-8">
          <div className="space-y-3">
            <div className="h-3 w-20 bg-surface-dim rounded animate-pulse" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-surface-dim rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 bg-surface-dim rounded animate-pulse" />
            <div className="h-2 bg-surface-dim rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-surface-dim rounded-lg animate-pulse" />
              <div className="h-10 flex-1 bg-surface-dim rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="h-8 w-40 bg-surface-dim rounded animate-pulse" />
              <div className="h-4 w-32 bg-surface-dim rounded animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-full sm:w-[240px] bg-surface-dim rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-surface-dim rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-border-light overflow-hidden"
              >
                <div className="aspect-square bg-surface-dim animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 bg-surface-dim rounded animate-pulse" />
                  <div className="h-4 w-full bg-surface-dim rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-surface-dim rounded animate-pulse" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div
                        key={j}
                        className="w-3 h-3 bg-surface-dim rounded-full animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="h-5 w-20 bg-surface-dim rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Centered Loading Indicator */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="text-sm font-medium text-text-secondary">
            Loading products...
          </span>
        </div>
      </div>
    </div>
  );
}
