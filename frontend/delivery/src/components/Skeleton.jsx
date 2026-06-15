export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function AuthGateSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-4 animate-fade-in">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function DeliveryDashboardSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8 animate-fade-in">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-orange-100 p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-fade-in">
      <Skeleton className="h-4 w-20" />
      <div className="bg-white rounded-2xl border overflow-hidden">
        <Skeleton className="h-12 w-full rounded-none" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2 border rounded-lg p-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  );
}
