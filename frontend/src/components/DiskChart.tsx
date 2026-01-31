import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { HistoryPoint, DiskMetrics } from '../types/metrics';
import { MetricCard } from './MetricCard';

interface DiskChartProps {
  history: HistoryPoint[];
  current: DiskMetrics | null;
}

export function DiskChart({ history, current }: DiskChartProps) {
  const formatSpeed = (mbps: number): string => {
    if (mbps >= 1000) {
      return `${(mbps / 1000).toFixed(2)} GB/s`;
    }
    return `${mbps.toFixed(2)} MB/s`;
  };

  return (
    <MetricCard
      title="Disk I/O"
      subtitle={current ? `Read: ${formatSpeed(current.read_speed / (1024 * 1024))} | Write: ${formatSpeed(current.write_speed / (1024 * 1024))}` : '--'}
      icon={
        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      }
      color="bg-orange-500/20"
      glowClass="glow-orange"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="readGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="writeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}M`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value) => [`${Number(value).toFixed(2)} MB/s`]}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
          <Area
            type="monotone"
            dataKey="read"
            name="Read"
            stroke="#f97316"
            fill="url(#readGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="write"
            name="Write"
            stroke="#eab308"
            fill="url(#writeGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
