import React, { useEffect, useRef } from 'react';
import { useTicketDetailQuery } from '../hooks/useTicketDetailQuery';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { X, User, Mail, Calendar, Clock, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';

interface TicketDrawerProps {
  ticketId: number | null;
  onClose: () => void;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({ ticketId, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const { data: ticket, isLoading, isError, error, refetch, isFetching } = useTicketDetailQuery(ticketId);

  // Store last active element to return focus when closed
  useEffect(() => {
    if (ticketId !== null) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      // Focus drawer close button when drawer opens
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    } else if (lastActiveElement.current) {
      // Try to focus triggering ticket row
      const targetRow = document.getElementById(`ticket-row-${ticketId}`);
      if (targetRow) {
        targetRow.focus();
      } else {
        lastActiveElement.current.focus();
      }
    }
  }, [ticketId]);

  // Handle ESC key to close drawer
  useEffect(() => {
    if (!ticketId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticketId, onClose]);

  if (!ticketId) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 transition-transform duration-300 ease-out"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                {ticket?.ticketNumber || `Ticket #${ticketId}`}
              </span>
              {ticket && (
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} size="sm" />
                  <PriorityBadge priority={ticket.priority} size="sm" />
                </div>
              )}
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Close ticket details"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4 py-8" role="status" aria-label="Loading ticket details">
                <div className="h-6 w-3/4 bg-slate-200 rounded animate-shimmer" />
                <div className="h-4 w-1/2 bg-slate-200 rounded animate-shimmer" />
                <div className="h-32 w-full bg-slate-200 rounded-lg animate-shimmer mt-6" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="h-16 bg-slate-200 rounded-lg animate-shimmer" />
                  <div className="h-16 bg-slate-200 rounded-lg animate-shimmer" />
                </div>
              </div>
            ) : isError ? (
              <div
                className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center my-8"
                role="alert"
              >
                <AlertTriangle size={32} className="text-rose-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-rose-900 mb-1">Failed to load ticket</h4>
                <p className="text-xs text-rose-700 mb-4">
                  {error instanceof Error ? error.message : 'A simulated network failure occurred.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                  <span>{isFetching ? 'Retrying...' : 'Retry'}</span>
                </button>
              </div>
            ) : ticket ? (
              <>
                {/* Subject Title */}
                <div>
                  <h2
                    id="ticket-drawer-title"
                    className="text-lg font-bold text-slate-900 leading-snug"
                  >
                    {ticket.subject}
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <CategoryBadge category={ticket.category} />
                    <span>•</span>
                    <span className="capitalize">{ticket.category} Department</span>
                  </div>
                </div>

                {/* Customer Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <User size={15} className="text-slate-400 shrink-0" />
                      <span>{ticket.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                      <Mail size={15} className="text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${ticket.customerEmail}`}
                        className="text-sky-600 hover:underline"
                      >
                        {ticket.customerEmail}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Issue Description
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assigned Employee */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                      <UserCheck size={14} />
                      <span>Assigned Agent</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {ticket.assignedTo}
                    </div>
                  </div>

                  {/* Created At */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>Created At</span>
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-700">
                      {new Date(ticket.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 sm:col-span-2">
                    <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Last Updated</span>
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-700">
                      {new Date(ticket.updatedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Press ESC to dismiss</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
