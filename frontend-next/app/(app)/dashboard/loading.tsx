export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-800" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-gray-800" />
    </div>
  );
}
