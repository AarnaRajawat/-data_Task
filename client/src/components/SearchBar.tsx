import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isFetching?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, isFetching = false }) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Sync external URL state to local input if URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the local input changes by ~300ms before calling onChange (which updates URL)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative w-full">
      <label htmlFor="ticket-search-input" className="sr-only">
        Search tickets, customers or subjects
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center">
          {isFetching ? (
            <Loader2 size={18} className="animate-spin text-sky-500" aria-hidden="true" />
          ) : (
            <Search size={18} aria-hidden="true" />
          )}
        </div>

        <input
          ref={inputRef}
          id="ticket-search-input"
          type="search"
          autoComplete="off"
          spellCheck="false"
          placeholder="Search tickets, customers or subjects..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />

        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Clear search input"
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
