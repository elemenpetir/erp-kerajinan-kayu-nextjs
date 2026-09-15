import { redirect } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ page, pageSize, count, basePath }) {
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  if (totalPages <= 1) return null;
  // Clamp: e.g. after deletes, ?page=5 of 2 → last page instead of empty table.
  if (page > totalPages) redirect(`${basePath}?page=${totalPages}`);
  return (
    <div className="flex items-center gap-2">
      {page > 1 && (
        <Button variant="outline" size="sm" asChild>
          <a href={`${basePath}?page=${page - 1}`}>
            <ChevronLeft />
            Prev
          </a>
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Hal {page} / {totalPages} ({count} data)
      </span>
      {page < totalPages && (
        <Button variant="outline" size="sm" asChild>
          <a href={`${basePath}?page=${page + 1}`}>
            Next
            <ChevronRight />
          </a>
        </Button>
      )}
    </div>
  );
}
