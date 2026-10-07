import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Ticket } from '../types/ticket';
import { TicketRow } from './TicketRow';

interface TicketTableProps {
  tickets: Ticket[];
  selectedTicketId: number | null;
  onSelectTicket: (ticket: Ticket) => void;
  isUpdating?: boolean;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  isUpdating = false,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tickets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // estimated row height in px
    overscan: 5,
  });

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Outer Container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10 select-none">
            <div className="w-28 shrink-0">Ticket</div>
            <div className="w-44 shrink-0 pr-3">Customer</div>
            <div className="flex-1 min-w-[200px] pr-4">Subject</div>
            <div className="w-28 shrink-0 px-2">Status</div>
            <div className="w-28 shrink-0 px-2">Priority</div>
            <div className="w-28 shrink-0 px-2 hidden lg:block">Category</div>
            <div className="w-36 shrink-0 px-2 hidden xl:block">Assigned To</div>
            <div className="w-28 shrink-0 text-right pr-2">Updated</div>
            <div className="w-6 shrink-0" />
          </div>

          {/* Virtualized Rows Container */}
          <div
            ref={parentRef}
            className="max-h-[600px] overflow-y-auto relative transition-opacity duration-150"
            style={{
              opacity: isUpdating ? 0.7 : 1,
            }}
            tabIndex={-1}
            role="region"
            aria-label="Support Tickets Table"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const ticket = tickets[virtualItem.index];
                if (!ticket) return null;

                return (
                  <div
                    key={ticket.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <TicketRow
                      ticket={ticket}
                      isSelected={selectedTicketId === ticket.id}
                      onSelect={onSelectTicket}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
