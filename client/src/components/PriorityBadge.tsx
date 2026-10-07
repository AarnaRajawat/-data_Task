import React from 'react';
import { TicketPriority } from '../types/ticket';
import { AlertOctagon, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: AlertOctagon,
  },
  high: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: ArrowUp,
  },
  low: {
    label: 'Low',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: ArrowDown,
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      role="status"
      aria-label={`Priority: ${config.label}`}
    >
      <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
