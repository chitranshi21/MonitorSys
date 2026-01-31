import React from 'react';

interface MetricCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  glowClass: string;
  children: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, icon, color, glowClass, children }: MetricCardProps) {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 ${glowClass} transition-all duration-300 hover:border-gray-700`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
          </div>
        </div>
        {value && (
          <span className={`text-2xl font-bold ${color.replace('bg-', 'text-').replace('/20', '')}`}>
            {value}
          </span>
        )}
      </div>
      <div className="h-48">
        {children}
      </div>
    </div>
  );
}
