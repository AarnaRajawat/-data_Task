import React, { useCallback } from 'react';
import { useTicketUrlParams } from '../hooks/useTicketUrlParams';
import { useTicketsQuery } from '../hooks/useTicketsQuery';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { SortControl } from '../components/SortControl';
import { TicketTable } from '../components/TicketTable';
import { Pagination } from '../components/Pagination';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { TicketDrawer } from '../components/TicketDrawer';
import { Ticket } from '../types/ticket';
import { Sparkles, Layers } from 'lucide-react';

export const TicketExplorerPage: React.FC = () => {
  const { state, updateFilters, setPage, clearFilters, openTicket, closeTicket } =
    useTicketUrlParams();

  // Fetch tickets with server-side params & cancellation
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useTicketsQuery({
    q: state.q,
    status: state.status,
    priority: state.priority,
    category: state.category,
    sort: state.sort,
    page: state.page,
    limit: 50,
  });

  const hasActiveFilters =
    Boolean(state.q) ||
    state.status !== 'all' ||
    state.priority !== 'all' ||
    state.category !== 'all' ||
    state.sort !== 'newest';

  const handleSearchChange = useCallback(
    (newQ: string) => {
      updateFilters({ q: newQ });
    },
    [updateFilters]
  );

  const handleStatusChange = useCallback(
    (newStatus: typeof state.status) => {
      updateFilters({ status: newStatus });
    },
    [updateFilters]
  );

  const handlePriorityChange = useCallback(
    (newPriority: typeof state.priority) => {
      updateFilters({ priority: newPriority });
    },
    [updateFilters]
  );

  const handleCategoryChange = useCallback(
    (newCategory: typeof state.category) => {
      updateFilters({ category: newCategory });
    },
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      updateFilters({ sort: newSort });
    },
    [updateFilters]
  );

  const handleSelectTicket = useCallback(
    (ticket: Ticket) => {
      openTicket(ticket.id);
    },
    [openTicket]
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 mb-2">
              <Sparkles size={12} />
              <span>Production Data Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Support Ticket Explorer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Search and analyze support tickets across a large dataset.
            </p>
          </div>

          {/* Quick dataset badge */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Dataset Records</div>
                <div className="text-sm font-bold text-slate-800 font-mono">
                  {data?.pagination ? data.pagination.total.toLocaleString() : '25,000+'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <SearchBar
              value={state.q}
              onChange={handleSearchChange}
              isFetching={isFetching}
            />
          </div>
          <div className="flex items-center justify-end">
            <SortControl value={state.sort} onChange={handleSortChange} />
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          status={state.status}
          priority={state.priority}
          category={state.category}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onCategoryChange={handleCategoryChange}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Main Content Area */}
      <section aria-label="Tickets data table" className="relative">
        {isLoading ? (
          <LoadingState rowCount={12} message="Loading support tickets..." />
        ) : isError ? (
          <ErrorState
            title="Unable to load tickets"
            message={
              error instanceof Error
                ? error.message
                : 'A simulated network failure occurred while querying the server.'
            }
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        ) : data && data.data.length === 0 ? (
          <EmptyState onClearFilters={clearFilters} searchTerm={state.q} />
        ) : data ? (
          <>
            <div className="relative">
              <TicketTable
                tickets={data.data}
                selectedTicketId={state.ticketId}
                onSelectTicket={handleSelectTicket}
                isUpdating={isPlaceholderData || isFetching}
              />

              {/* Discreet updating indicator if query is fetching in background */}
              {isFetching && (
                <div className="absolute top-2 right-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-sky-600 text-white shadow-md animate-pulse">
                    Updating...
                  </span>
                </div>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              pagination={data.pagination}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          </>
        ) : null}
      </section>

      {/* Deep-Linked Detail Drawer */}
      <TicketDrawer ticketId={state.ticketId} onClose={closeTicket} />
    </main>
  );
};
