import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70 text-blue-600',
      border: 'hover:border-blue-200',
      pill: 'text-blue-700 bg-blue-100/60',
    },
    emerald: {
      bg: 'bg-emerald-50/70 text-emerald-600',
      border: 'hover:border-emerald-200',
      pill: 'text-emerald-700 bg-emerald-100/60',
    },
    rose: {
      bg: 'bg-rose-50/70 text-rose-600',
      border: 'hover:border-rose-200',
      pill: 'text-rose-700 bg-rose-100/60',
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-600',
      border: 'hover:border-amber-200',
      pill: 'text-amber-700 bg-amber-100/60',
    },
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-600',
      border: 'hover:border-indigo-200',
      pill: 'text-indigo-700 bg-indigo-100/60',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 ${currentTheme.border} hover:shadow-md relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${currentTheme.bg} transition-transform group-hover:scale-110 duration-200`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={`px-1.5 py-0.5 rounded font-medium ${currentTheme.pill}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
