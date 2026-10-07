import React from 'react';
import { useApiHealthQuery } from '../hooks/useApiHealthQuery';
import { Layers, RefreshCw, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { data: health, isLoading, isError, refetch, isFetching } = useApiHealthQuery();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base">DareAI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Data Explorer
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Explore, filter and analyze large-scale support ticket data.
              </p>
            </div>
          </div>

          {/* Real API Status Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isLoading
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : isError
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              role="status"
              aria-live="polite"
              title={
                isError
                  ? 'API Connection Offline or Unreachable'
                  : `API Online • ${health?.datasetRecords?.toLocaleString() || 25000} records loaded`
              }
            >
              {isLoading ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                  <span>Checking API...</span>
                </>
              ) : isError ? (
                <>
                  <WifiOff size={13} className="text-rose-600 shrink-0" />
                  <span>API Offline</span>
                  <button
                    onClick={() => refetch()}
                    className="ml-1 underline hover:text-rose-800 text-[11px] focus:outline-none"
                    aria-label="Retry connecting to API"
                  >
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>API Online</span>
                  <span className="text-emerald-600/70 font-mono text-[11px] hidden md:inline">
                    ({health?.datasetRecords?.toLocaleString() || '25,000'} records)
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Ping API Health"
              aria-label="Refresh API Health"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
