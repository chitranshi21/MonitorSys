import { useState, useEffect, useRef, useCallback } from 'react';
import type { SystemMetrics, HistoryPoint } from '../types/metrics';

const MAX_HISTORY_POINTS = 60;

export function useMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [cpuHistory, setCpuHistory] = useState<HistoryPoint[]>([]);
  const [ramHistory, setRamHistory] = useState<HistoryPoint[]>([]);
  const [networkHistory, setNetworkHistory] = useState<HistoryPoint[]>([]);
  const [diskHistory, setDiskHistory] = useState<HistoryPoint[]>([]);
  const [gpuHistory, setGpuHistory] = useState<HistoryPoint[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data: SystemMetrics = JSON.parse(event.data);
      setMetrics(data);

      const timeStr = new Date(data.timestamp * 1000).toLocaleTimeString();

      // Update CPU history
      setCpuHistory((prev) => {
        const point: HistoryPoint = { time: timeStr };
        data.cpu.cores.forEach((val, idx) => {
          point[`core${idx}`] = val;
        });
        point['average'] = data.cpu.average;
        const newHistory = [...prev, point];
        return newHistory.slice(-MAX_HISTORY_POINTS);
      });

      // Update RAM history
      setRamHistory((prev) => {
        const point: HistoryPoint = {
          time: timeStr,
          used: data.ram.used / (1024 * 1024 * 1024),
          available: data.ram.available / (1024 * 1024 * 1024),
          percent: data.ram.percent,
        };
        const newHistory = [...prev, point];
        return newHistory.slice(-MAX_HISTORY_POINTS);
      });

      // Update Network history
      setNetworkHistory((prev) => {
        const point: HistoryPoint = { time: timeStr };
        let totalUp = 0;
        let totalDown = 0;
        Object.entries(data.network.interfaces).forEach(([name, iface]) => {
          if (name !== 'lo') {
            totalUp += iface.speed_up;
            totalDown += iface.speed_down;
          }
        });
        point['upload'] = totalUp / (1024 * 1024);
        point['download'] = totalDown / (1024 * 1024);
        const newHistory = [...prev, point];
        return newHistory.slice(-MAX_HISTORY_POINTS);
      });

      // Update Disk history
      setDiskHistory((prev) => {
        const point: HistoryPoint = {
          time: timeStr,
          read: data.disk.read_speed / (1024 * 1024),
          write: data.disk.write_speed / (1024 * 1024),
        };
        const newHistory = [...prev, point];
        return newHistory.slice(-MAX_HISTORY_POINTS);
      });

      // Update GPU history
      if (data.gpu) {
        setGpuHistory((prev) => {
          const point: HistoryPoint = {
            time: timeStr,
            utilization: data.gpu!.utilization,
            vram: data.gpu!.memory_percent,
            temperature: data.gpu!.temperature,
          };
          const newHistory = [...prev, point];
          return newHistory.slice(-MAX_HISTORY_POINTS);
        });
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected, reconnecting...');
      reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    metrics,
    cpuHistory,
    ramHistory,
    networkHistory,
    diskHistory,
    gpuHistory,
    connected,
  };
}
