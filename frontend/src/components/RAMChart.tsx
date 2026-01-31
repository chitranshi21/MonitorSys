import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { HistoryPoint, RAMMetrics } from '../types/metrics';
import { MetricCard } from './MetricCard';

interface RAMChartProps {
  history: HistoryPoint[];
  current: RAMMetrics | null;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

export function RAMChart({ history, current }: RAMChartProps) {
  const totalGB = current ? current.total / (1024 * 1024 * 1024) : 0;

  return (
    <MetricCard
      title="Memory Usage"
      value={current ? `${current.percent.toFixed(1)}%` : '--'}
      subtitle={current ? `${formatBytes(current.used)} / ${formatBytes(current.total)}` : '--'}
      icon={
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
      color="bg-purple-500/20"
      glowClass="glow-purple"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, totalGB]} tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}G`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value) => [`${Number(value).toFixed(2)} GB`, 'Used']}
          />
          <Area
            type="monotone"
            dataKey="used"
            stroke="#a855f7"
            fill="url(#ramGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
