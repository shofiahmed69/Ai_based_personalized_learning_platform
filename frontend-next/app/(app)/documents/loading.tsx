export default function DocumentsLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-gray-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-800" />
        ))}
      </div>
    </div>
  );
}
