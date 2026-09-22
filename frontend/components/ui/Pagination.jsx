import * as React from 'react';
import { redirect } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { buttonVariants } from '@/components/ui/button';

// --- Primitif pagination pola shadcn (API standar) ---

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

const PaginationLink = ({ className, isActive, size = 'icon', onClick, ...props }) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
      className,
    )}
    onClick={onClick}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }) => (
  <PaginationLink aria-label="Ke halaman sebelumnya" size="sm" className={cn('gap-1 pl-2.5', className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Prev</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }) => (
  <PaginationLink aria-label="Ke halaman berikutnya" size="sm" className={cn('gap-1 pr-2.5', className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }) => (
  <span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Halaman lain</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

// --- Komponen smart: logika clamp + jendela nomor, dirender via primitif di atas ---
// ponytail: O(1) link bernomor (jendela 5 + ellipsis), bukan O(N) untuk ribuan halaman.
function pageWindow(page, total) {
  const set = new Set([1, page - 1, page, page + 1, total].filter((n) => n >= 1 && n <= total));
  const nums = [...set].sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pageSize, count, basePath, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  if (totalPages <= 1) return null;
  // Clamp: e.g. after deletes, ?page=5 of 2 → last page instead of empty table.
  if (page > totalPages) {
    if (onPageChange) onPageChange(totalPages);
    else redirect(`${basePath}?page=${totalPages}`);
    return null;
  }

  const handlePageClick = (newPage) => {
    if (onPageChange) onPageChange(newPage);
    // else default <a href> behavior
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav role="navigation" aria-label="pagination">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageClick(page - 1)}
                href={onPageChange ? undefined : `${basePath}?page=${page - 1}`}
              />
            </PaginationItem>
          )}
          {pageWindow(page, totalPages).map((n, i) =>
            n === '…' ? (
              <PaginationItem key={`e${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={n}>
                <PaginationLink
                  onClick={() => handlePageClick(n)}
                  href={onPageChange ? undefined : `${basePath}?page=${n}`}
                  isActive={n === page}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageClick(page + 1)}
                href={onPageChange ? undefined : `${basePath}?page=${page + 1}`}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </nav>
      <span className="text-sm text-muted-foreground">
        Hal {page} / {totalPages} ({count} data)
      </span>
    </div>
  );
}

export {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
