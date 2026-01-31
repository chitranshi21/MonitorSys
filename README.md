# MonitorSys

A real-time system resource monitoring application with a web-based dashboard. MonitorSys provides live visualization of CPU, RAM, Network, Disk I/O, and GPU metrics through interactive charts updated every second via WebSocket.

## Features

- **Real-time Monitoring** - 1-second update interval with WebSocket streaming
- **CPU Metrics** - Per-core usage and frequency visualization
- **RAM Metrics** - Memory usage percentage and statistics
- **Network Metrics** - Upload/download speeds per interface
- **Disk I/O Metrics** - Read/write speeds
- **GPU Metrics** - NVIDIA GPU utilization, VRAM, and temperature (optional)
- **Historical Data** - Rolling 60-point data history for trend analysis
- **Auto-reconnection** - Automatic WebSocket reconnection on disconnect
- **Responsive UI** - Adaptive grid layout with dark theme

<img width="2489" height="875" alt="image" src="https://github.com/user-attachments/assets/3916c683-c6d0-4b5a-8c3d-c2eaf317b9ad" />

## Tech Stack

**Backend:**
- Python 3.12+
- FastAPI - Async web framework
- Uvicorn - ASGI server
- psutil - System metrics collection
- pynvml - NVIDIA GPU monitoring (optional)

**Frontend:**
- React 19 with TypeScript
- Vite - Build tool
- Tailwind CSS - Styling
- Recharts - Data visualization

## Project Structure

```
MonitorSys/
├── backend/
│   ├── main.py              # FastAPI server & metrics collection
│   └── venv/                # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/      # Chart components (CPU, RAM, Network, Disk, GPU)
│   │   ├── hooks/           # useMetrics WebSocket hook
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Main dashboard
│   │   └── main.tsx         # Entry point
│   ├── dist/                # Production build output
│   ├── package.json
│   └── vite.config.ts
└── start.sh                 # Startup script
```

## Prerequisites

- Node.js (v18+ recommended)
- Python 3.12+
- NVIDIA drivers (optional, for GPU monitoring)

## Installation

### Quick Setup

```bash
# Clone or navigate to the project
cd MonitorSys

# Make start script executable
chmod +x start.sh

# Run the application
./start.sh
```

The start script will automatically:
1. Build the frontend if not already built
2. Activate the Python virtual environment
3. Start the server on port 8000

### Manual Setup

**Frontend:**

```bash
cd frontend
npm install
npm run build
```

**Backend:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn psutil pynvml
```

## Usage

1. Start the application:
   ```bash
   ./start.sh
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

3. The dashboard will display real-time metrics with live-updating charts.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the frontend dashboard |
| `/api/status` | GET | Health check endpoint |
| `/metrics` | GET | Single metrics snapshot (JSON) |
| `/ws` | WebSocket | Real-time metrics streaming |

## Architecture

```
┌─────────────────┐         WebSocket         ┌─────────────────┐
│                 │◄─────────────────────────►│                 │
│  React Frontend │                           │  FastAPI Server │
│   (Dashboard)   │         /ws               │                 │
│                 │                           │  MetricsCollector│
└─────────────────┘                           └────────┬────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │     psutil      │
                                              │     pynvml      │
                                              │  (System APIs)  │
                                              └─────────────────┘
```

The backend collects system metrics using `psutil` (and `pynvml` for GPU) and broadcasts them to all connected clients via WebSocket every second. The frontend maintains a 60-point rolling history for each metric type to display trends.

## Configuration

The server binds to `0.0.0.0:8000` by default. To change the port, modify the `start.sh` script or run manually:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port <your-port>
```

## Development

**Frontend development server:**

```bash
cd frontend
npm run dev
```

This starts the Vite dev server with hot module replacement. Note: You'll need the backend running separately for the WebSocket connection.

**Backend development:**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

The `--reload` flag enables auto-restart on code changes.

## License

This project is open source and available under the MIT License.
