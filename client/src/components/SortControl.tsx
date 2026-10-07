import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortControlProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'updated-asc', label: 'Least recently updated' },
  { value: 'priority-desc', label: 'Priority high → low' },
  { value: 'priority-asc', label: 'Priority low → high' },
];

export const SortControl: React.FC<SortControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-medium text-slate-500 shrink-0 flex items-center gap-1">
        <ArrowUpDown size={14} aria-hidden="true" />
        <span>Sort:</span>
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
