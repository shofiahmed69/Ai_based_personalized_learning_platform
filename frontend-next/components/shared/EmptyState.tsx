import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50 py-16 px-6 text-center">
      <p className="text-lg font-medium text-gray-100">{title}</p>
      <p className="mt-1 text-gray-400">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
