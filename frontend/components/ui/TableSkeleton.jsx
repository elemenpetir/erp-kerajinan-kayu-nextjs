import { Skeleton } from '@/components/ui/skeleton';

// Table-shaped loading fallback shared by all list loading.jsx files.
export default function TableSkeleton({ rows = 8, cols = 6 }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-2">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={c} className="h-8 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
