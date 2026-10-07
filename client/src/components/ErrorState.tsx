import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load tickets',
  message = 'Something went wrong while fetching the data. The server simulated network latency or a temporary failure.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      className="w-full bg-rose-50/50 border border-rose-200 rounded-xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center justify-center my-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="h-14 w-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
        <AlertTriangle size={28} />
      </div>

      <h3 className="text-base font-semibold text-rose-900 mb-1">{title}</h3>

      <p className="text-sm text-rose-700 max-w-md mb-6">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-60"
      >
        <RefreshCw size={15} className={isRetrying ? 'animate-spin' : ''} />
        <span>{isRetrying ? 'Retrying...' : 'Retry Request'}</span>
      </button>
    </div>
  );
};
