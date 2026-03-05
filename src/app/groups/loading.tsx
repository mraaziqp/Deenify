export default function GroupsLoading() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-32 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Group cards skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-l-4 border-l-emerald-300 rounded-xl bg-white shadow-sm p-5 space-y-3 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex gap-2 items-center">
                <div className="h-6 w-40 rounded bg-gray-200" />
                <div className="h-5 w-16 rounded-full bg-gray-200" />
              </div>
              <div className="h-4 w-72 rounded bg-gray-200" />
              <div className="flex gap-4 mt-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="h-8 w-20 rounded-lg bg-gray-200" />
              <div className="h-8 w-16 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
