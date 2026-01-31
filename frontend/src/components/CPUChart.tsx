import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { HistoryPoint, CPUMetrics } from '../types/metrics';
import { MetricCard } from './MetricCard';

interface CPUChartProps {
  history: HistoryPoint[];
  current: CPUMetrics | null;
}

const CORE_COLORS = [
  '#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899',
  '#3b82f6', '#14b8a6', '#f97316', '#a855f7', '#84cc16', '#06b6d4',
  '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6',
  '#14b8a6', '#f97316',
];

export function CPUChart({ history, current }: CPUChartProps) {
  const coreCount = current?.cores.length ?? 0;

  return (
    <MetricCard
      title="CPU Usage"
      value={current ? `${current.average.toFixed(1)}%` : '--'}
      subtitle={`${coreCount} Cores @ ${current ? (current.frequency / 1000).toFixed(2) : '--'} GHz`}
      icon={
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      }
      color="bg-cyan-500/20"
      glowClass="glow-cyan"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            {Array.from({ length: coreCount }).map((_, idx) => (
              <linearGradient key={idx} id={`cpuGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CORE_COLORS[idx % CORE_COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CORE_COLORS[idx % CORE_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#fff' }}
          />
          {Array.from({ length: coreCount }).map((_, idx) => (
            <Area
              key={idx}
              type="monotone"
              dataKey={`core${idx}`}
              stroke={CORE_COLORS[idx % CORE_COLORS.length]}
              fill={`url(#cpuGradient${idx})`}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
