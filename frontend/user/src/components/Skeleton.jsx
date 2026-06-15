/** Shimmer placeholder block */
export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function AuthGateSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-4 py-8 animate-fade-in">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function MenuGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-72 max-w-full mx-auto" />
        <Skeleton className="h-4 w-56 max-w-full mx-auto" />
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-50 overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-3 stagger-children">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-orange-100 p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <div className="border-t pt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RestaurantSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border p-8 space-y-4 text-center">
        <Skeleton className="h-10 w-56 mx-auto" />
        <Skeleton className="h-6 w-40 mx-auto" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
