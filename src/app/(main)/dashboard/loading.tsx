export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-2 py-3 sm:px-4 md:px-8 max-w-5xl space-y-4">
      {/* Hero banner skeleton */}
      <div className="h-36 rounded-3xl bg-gradient-to-r from-emerald-800/60 to-emerald-700/60 animate-pulse" />

      {/* Quick tiles skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>

      {/* Sponsored banner skeleton */}
      <div className="h-20 rounded-2xl bg-gray-200 animate-pulse" />

      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded-md bg-gray-200 animate-pulse" />
        ))}
      </div>

      {/* Tab content skeleton */}
      <div className="h-40 rounded-xl bg-gray-200 animate-pulse" />
    </div>
  );
}
