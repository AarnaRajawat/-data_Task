import React from 'react';
import { TicketCategory } from '../types/ticket';
import { CreditCard, Cpu, User, Package, Truck, HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: TicketCategory;
}

const CATEGORY_CONFIG: Record<
  TicketCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  billing: { label: 'Billing', icon: CreditCard, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  technical: { label: 'Technical', icon: Cpu, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  account: { label: 'Account', icon: User, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  product: { label: 'Product', icon: Package, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  shipping: { label: 'Shipping', icon: Truck, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${config.color}`}
    >
      <Icon size={12} className="shrink-0" aria-hidden="true" />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
