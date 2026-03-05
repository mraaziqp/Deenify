export default function LibraryLoading() {
  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-4 w-80 rounded bg-gray-200 animate-pulse" />
      </div>

      {/* Search bar */}
      <div className="h-11 w-full rounded-xl bg-gray-200 animate-pulse" />

      {/* Book cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm border animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
              <div className="h-8 w-full rounded-lg bg-gray-200 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
