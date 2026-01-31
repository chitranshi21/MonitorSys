export interface CPUMetrics {
  cores: number[];
  average: number;
  frequency: number;
}

export interface RAMMetrics {
  total: number;
  used: number;
  available: number;
  percent: number;
}

export interface NetworkMetrics {
  interfaces: {
    [key: string]: {
      bytes_sent: number;
      bytes_recv: number;
      speed_up: number;
      speed_down: number;
    };
  };
}

export interface DiskMetrics {
  read_bytes: number;
  write_bytes: number;
  read_speed: number;
  write_speed: number;
}

export interface GPUMetrics {
  name: string;
  utilization: number;
  memory_total: number;
  memory_used: number;
  memory_percent: number;
  temperature: number;
}

export interface SystemMetrics {
  timestamp: number;
  cpu: CPUMetrics;
  ram: RAMMetrics;
  network: NetworkMetrics;
  disk: DiskMetrics;
  gpu: GPUMetrics | null;
}

export interface HistoryPoint {
  time: string;
  [key: string]: string | number;
}
