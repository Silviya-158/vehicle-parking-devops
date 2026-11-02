import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const configs = {
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    OCCUPIED: {
      label: 'Occupied',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
    RESERVED: {
      label: 'Reserved',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    MAINTENANCE: {
      label: 'Maintenance',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-500',
    },
    PARKED: {
      label: 'Parked',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    CONFIRMED: {
      label: 'Confirmed',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    CHECKED_IN: {
      label: 'Checked In',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-100 text-slate-600 border-slate-300',
      dot: 'bg-slate-400',
    },
    ACTIVE: {
      label: 'Active',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    INACTIVE: {
      label: 'Inactive',
      bg: 'bg-rose-50 text-rose-600 border-rose-200',
      dot: 'bg-rose-400',
    },
  };

  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};
