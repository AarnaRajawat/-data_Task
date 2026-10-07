import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
  searchTerm?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters, searchTerm }) => {
  return (
    <div
      className="w-full bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center my-6"
      role="region"
      aria-label="No results"
    >
      <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
        <SearchX size={28} />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">No tickets found</h3>

      <p className="text-sm text-slate-500 max-w-sm mb-6">
        {searchTerm
          ? `We couldn't find any tickets matching "${searchTerm}". Try checking for typos or removing specific filters.`
          : 'Try changing your search keywords or adjusting your status, priority, or category filters.'}
      </p>

      <button
        type="button"
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        <RotateCcw size={15} />
        <span>Clear filters</span>
      </button>
    </div>
  );
};
