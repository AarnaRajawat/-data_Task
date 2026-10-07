import React from 'react';
import { Ticket } from '../types/ticket';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { ChevronRight } from 'lucide-react';

interface TicketRowProps {
  ticket: Ticket;
  isSelected?: boolean;
  onSelect: (ticket: Ticket) => void;
  style?: React.CSSProperties;
}

export const TicketRow = React.memo<TicketRowProps>(({ ticket, isSelected = false, onSelect, style }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(ticket.updatedAt));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(ticket);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      id={`ticket-row-${ticket.id}`}
      style={style}
      onClick={() => onSelect(ticket)}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
      aria-label={`Ticket ${ticket.ticketNumber}: ${ticket.subject}, Customer: ${ticket.customerName}, Status: ${ticket.status}, Priority: ${ticket.priority}`}
      className={`group flex items-center px-4 py-3.5 border-b border-slate-100 text-sm transition-colors cursor-pointer select-none outline-none ${
        isSelected
          ? 'bg-sky-50/80 border-sky-200 ring-1 ring-inset ring-sky-300'
          : 'bg-white hover:bg-slate-50/90 focus-visible:bg-sky-50/50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset'
      }`}
    >
      {/* 1. Ticket Number */}
      <div className="w-28 shrink-0 font-mono text-xs font-semibold text-sky-700">
        {ticket.ticketNumber}
      </div>

      {/* 2. Customer */}
      <div className="w-44 shrink-0 pr-3">
        <div className="font-medium text-slate-900 truncate" title={ticket.customerName}>
          {ticket.customerName}
        </div>
        <div className="text-xs text-slate-400 truncate" title={ticket.customerEmail}>
          {ticket.customerEmail}
        </div>
      </div>

      {/* 3. Subject & Preview */}
      <div className="flex-1 min-w-[200px] pr-4">
        <div className="font-medium text-slate-800 truncate" title={ticket.subject}>
          {ticket.subject}
        </div>
        <div className="text-xs text-slate-400 truncate hidden md:block" title={ticket.description}>
          {ticket.description}
        </div>
      </div>

      {/* 4. Status Badge */}
      <div className="w-28 shrink-0 px-2">
        <StatusBadge status={ticket.status} />
      </div>

      {/* 5. Priority Badge */}
      <div className="w-28 shrink-0 px-2">
        <PriorityBadge priority={ticket.priority} />
      </div>

      {/* 6. Category */}
      <div className="w-28 shrink-0 px-2 hidden lg:block">
        <CategoryBadge category={ticket.category} />
      </div>

      {/* 7. Assigned To */}
      <div className="w-36 shrink-0 text-xs text-slate-600 truncate px-2 hidden xl:block" title={ticket.assignedTo}>
        {ticket.assignedTo}
      </div>

      {/* 8. Updated Date */}
      <div className="w-28 shrink-0 text-right text-xs text-slate-500 font-mono pr-2">
        {formattedDate}
      </div>

      {/* Arrow Indicator */}
      <div className="w-6 shrink-0 flex justify-end text-slate-300 group-hover:text-slate-500 transition-colors">
        <ChevronRight size={16} />
      </div>
    </div>
  );
});

TicketRow.displayName = 'TicketRow';
