import { useMetrics } from './hooks/useMetrics';
import { CPUChart } from './components/CPUChart';
import { RAMChart } from './components/RAMChart';
import { NetworkChart } from './components/NetworkChart';
import { DiskChart } from './components/DiskChart';
import { GPUChart } from './components/GPUChart';

function App() {
  const {
    metrics,
    cpuHistory,
    ramHistory,
    networkHistory,
    diskHistory,
    gpuHistory,
    connected,
  } = useMetrics();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">System Monitor</h1>
            <p className="text-gray-400 text-sm">Real-time hardware monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${connected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* CPU - Takes 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <CPUChart history={cpuHistory} current={metrics?.cpu || null} />
        </div>

        {/* RAM */}
        <div>
          <RAMChart history={ramHistory} current={metrics?.ram || null} />
        </div>

        {/* Network */}
        <div>
          <NetworkChart history={networkHistory} current={metrics?.network || null} />
        </div>

        {/* Disk I/O */}
        <div>
          <DiskChart history={diskHistory} current={metrics?.disk || null} />
        </div>

        {/* GPU */}
        {(metrics?.gpu || gpuHistory.length > 0) && (
          <div>
            <GPUChart history={gpuHistory} current={metrics?.gpu || null} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>MonitorSys - System Resource Monitor</p>
      </footer>
    </div>
  );
}

export default App;
