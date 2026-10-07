import React from 'react';
import { TicketStatus } from '../types/ticket';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  open: {
    label: 'Open',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: AlertCircle,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: XCircle,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
