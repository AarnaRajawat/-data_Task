import React, { useState } from 'react';
import { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  category: TicketCategory | 'all';
  onStatusChange: (status: TicketStatus | 'all') => void;
  onPriorityChange: (priority: TicketPriority | 'all') => void;
  onCategoryChange: (category: TicketCategory | 'all') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS: { value: TicketPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CATEGORY_OPTIONS: { value: TicketCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'account', label: 'Account' },
  { value: 'product', label: 'Product' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'other', label: 'Other' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  status,
  priority,
  category,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
      {/* Mobile Toggle Bar */}
      <div className="flex sm:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 py-1"
          aria-expanded={mobileExpanded}
          aria-controls="mobile-filter-panel"
        >
          <Filter size={15} className="text-sky-600" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-sky-500 inline-block" aria-label="Active filters" />
          )}
          {mobileExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Select Controls */}
      <div
        id="mobile-filter-panel"
        className={`${
          mobileExpanded ? 'flex' : 'hidden'
        } sm:flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100`}
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-status" className="sr-only">
              Filter by Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as TicketStatus | 'all')}
              className={`w-full sm:w-auto text-xs font-medium rounded-lg px-3 py-2 border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer ${
                status !== 'all'
                  ? 'bg-sky-50/50 border-sky-300 text-sky-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-priority" className="sr-only">
              Filter by Priority
            </label>
            <select
              id="filter-priority"
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value as TicketPriority | 'all')}
              className={`w-full sm:w-auto text-xs font-medium rounded-lg px-3 py-2 border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer ${
                priority !== 'all'
                  ? 'bg-sky-50/50 border-sky-300 text-sky-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-category" className="sr-only">
              Filter by Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as TicketCategory | 'all')}
              className={`w-full sm:w-auto text-xs font-medium rounded-lg px-3 py-2 border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer ${
                category !== 'all'
                  ? 'bg-sky-50/50 border-sky-300 text-sky-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Clear all active filters"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
