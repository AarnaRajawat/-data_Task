import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  rowCount?: number;
  message?: string;
  isOverlay?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  rowCount = 10,
  message = 'Loading tickets...',
  isOverlay = false,
}) => {
  if (isOverlay) {
    return (
      <div
        className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3 transition-opacity duration-200"
        role="status"
        aria-live="polite"
      >
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-sky-600" />
          <span className="text-sm font-medium text-slate-700">Updating results...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50/50">
        <Loader2 size={15} className="animate-spin text-sky-600" aria-hidden="true" />
        <span>{message}</span>
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: rowCount }).map((_, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-1/4">
              <div className="h-4 w-20 bg-slate-200 rounded animate-shimmer" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-shimmer hidden md:block" />
            </div>
            <div className="h-4 w-2/5 bg-slate-200 rounded animate-shimmer" />
            <div className="flex items-center gap-3 w-1/4 justify-end">
              <div className="h-5 w-16 bg-slate-200 rounded-full animate-shimmer" />
              <div className="h-5 w-16 bg-slate-200 rounded-full animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
