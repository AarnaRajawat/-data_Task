import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMetadata } from '../types/ticket';

interface PaginationProps {
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  isLoading = false,
}) => {
  const { page, limit, total, totalPages } = pagination;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        start = 2;
        end = 4;
      } else if (page >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (total === 0) return null;

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2"
    >
      {/* Result Count with accessible live region */}
      <div
        className="text-xs sm:text-sm text-slate-500 font-medium"
        aria-live="polite"
        role="status"
      >
        Showing <span className="font-semibold text-slate-900">{startRecord.toLocaleString()}</span>–
        <span className="font-semibold text-slate-900">{endRecord.toLocaleString()}</span> of{' '}
        <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> tickets
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
          aria-label="Go to first page"
          title="First page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          aria-label="Go to previous page"
          title="Previous page"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <span
                  key={`${item}-${idx}`}
                  className="px-2 py-1 text-xs text-slate-400 select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === page;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={isLoading}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isCurrent
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          aria-label="Go to next page"
          title="Next page"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isLoading}
          aria-label="Go to last page"
          title="Last page"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </nav>
  );
};
