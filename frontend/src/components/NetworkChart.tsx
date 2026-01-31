import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { HistoryPoint, NetworkMetrics } from '../types/metrics';
import { MetricCard } from './MetricCard';

interface NetworkChartProps {
  history: HistoryPoint[];
  current: NetworkMetrics | null;
}

export function NetworkChart({ history, current }: NetworkChartProps) {
  let totalUp = 0;
  let totalDown = 0;

  if (current) {
    Object.entries(current.interfaces).forEach(([name, iface]) => {
      if (name !== 'lo') {
        totalUp += iface.speed_up;
        totalDown += iface.speed_down;
      }
    });
  }

  const formatSpeed = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
    }
    return `${(bytes / 1024).toFixed(2)} KB/s`;
  };

  return (
    <MetricCard
      title="Network"
      subtitle={current ? `Up: ${formatSpeed(totalUp)} | Down: ${formatSpeed(totalDown)}` : '--'}
      icon={
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      }
      color="bg-green-500/20"
      glowClass="glow-green"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(1)}M`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value) => [`${Number(value).toFixed(2)} MB/s`]}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
          <Area
            type="monotone"
            dataKey="upload"
            name="Upload"
            stroke="#22c55e"
            fill="url(#uploadGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="download"
            name="Download"
            stroke="#3b82f6"
            fill="url(#downloadGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
