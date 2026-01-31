import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { HistoryPoint, GPUMetrics } from '../types/metrics';
import { MetricCard } from './MetricCard';

interface GPUChartProps {
  history: HistoryPoint[];
  current: GPUMetrics | null;
}

export function GPUChart({ history, current }: GPUChartProps) {
  const formatMemory = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <MetricCard
      title={current?.name || 'GPU'}
      value={current ? `${current.utilization}%` : '--'}
      subtitle={current ? `VRAM: ${formatMemory(current.memory_used)} / ${formatMemory(current.memory_total)} | ${current.temperature}C` : '--'}
      icon={
        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
      color="bg-pink-500/20"
      glowClass="glow-pink"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="gpuUtilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name === 'utilization' ? 'GPU' : 'VRAM']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
          <Area
            type="monotone"
            dataKey="utilization"
            name="GPU"
            stroke="#ec4899"
            fill="url(#gpuUtilGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="vram"
            name="VRAM"
            stroke="#8b5cf6"
            fill="url(#vramGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
