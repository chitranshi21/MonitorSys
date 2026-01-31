import asyncio
import json
import time
import os
from pathlib import Path
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Try to import nvidia-ml-py for NVIDIA GPU monitoring
try:
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", FutureWarning)
        from pynvml import nvmlInit, nvmlDeviceGetHandleByIndex, nvmlDeviceGetName, nvmlDeviceGetUtilizationRates, nvmlDeviceGetMemoryInfo, nvmlDeviceGetTemperature, nvmlShutdown, NVML_TEMPERATURE_GPU
    nvmlInit()
    GPU_AVAILABLE = True
    GPU_HANDLE = nvmlDeviceGetHandleByIndex(0)
except Exception:
    GPU_AVAILABLE = False
    GPU_HANDLE = None
    nvmlDeviceGetName = None
    nvmlDeviceGetUtilizationRates = None
    nvmlDeviceGetMemoryInfo = None
    nvmlDeviceGetTemperature = None
    nvmlShutdown = None
    NVML_TEMPERATURE_GPU = None


class MetricsCollector:
    def __init__(self):
        self.prev_net_io = psutil.net_io_counters(pernic=True)
        self.prev_disk_io = psutil.disk_io_counters()
        self.prev_time = time.time()

    def get_cpu_metrics(self) -> Dict[str, Any]:
        cores = psutil.cpu_percent(percpu=True)
        freq = psutil.cpu_freq()
        return {
            "cores": cores,
            "average": sum(cores) / len(cores) if cores else 0,
            "frequency": freq.current if freq else 0,
        }

    def get_ram_metrics(self) -> Dict[str, Any]:
        mem = psutil.virtual_memory()
        return {
            "total": mem.total,
            "used": mem.used,
            "available": mem.available,
            "percent": mem.percent,
        }

    def get_network_metrics(self) -> Dict[str, Any]:
        current_time = time.time()
        time_delta = current_time - self.prev_time
        if time_delta == 0:
            time_delta = 1

        current_net_io = psutil.net_io_counters(pernic=True)
        interfaces = {}

        for name, counters in current_net_io.items():
            prev = self.prev_net_io.get(name)
            if prev:
                bytes_sent_delta = counters.bytes_sent - prev.bytes_sent
                bytes_recv_delta = counters.bytes_recv - prev.bytes_recv
                speed_up = bytes_sent_delta / time_delta
                speed_down = bytes_recv_delta / time_delta
            else:
                speed_up = 0
                speed_down = 0

            interfaces[name] = {
                "bytes_sent": counters.bytes_sent,
                "bytes_recv": counters.bytes_recv,
                "speed_up": speed_up,
                "speed_down": speed_down,
            }

        self.prev_net_io = current_net_io
        return {"interfaces": interfaces}

    def get_disk_metrics(self) -> Dict[str, Any]:
        current_time = time.time()
        time_delta = current_time - self.prev_time
        if time_delta == 0:
            time_delta = 1

        current_disk_io = psutil.disk_io_counters()

        read_speed = (current_disk_io.read_bytes - self.prev_disk_io.read_bytes) / time_delta
        write_speed = (current_disk_io.write_bytes - self.prev_disk_io.write_bytes) / time_delta

        self.prev_disk_io = current_disk_io
        self.prev_time = current_time

        return {
            "read_bytes": current_disk_io.read_bytes,
            "write_bytes": current_disk_io.write_bytes,
            "read_speed": max(0, read_speed),
            "write_speed": max(0, write_speed),
        }

    def get_gpu_metrics(self) -> Optional[Dict[str, Any]]:
        if not GPU_AVAILABLE or not GPU_HANDLE:
            return None

        try:
            name = nvmlDeviceGetName(GPU_HANDLE)
            utilization = nvmlDeviceGetUtilizationRates(GPU_HANDLE)
            memory = nvmlDeviceGetMemoryInfo(GPU_HANDLE)
            temperature = nvmlDeviceGetTemperature(GPU_HANDLE, NVML_TEMPERATURE_GPU)

            return {
                "name": name,
                "utilization": utilization.gpu,
                "memory_total": memory.total / (1024 * 1024),  # Convert to MB
                "memory_used": memory.used / (1024 * 1024),
                "memory_percent": (memory.used / memory.total) * 100,
                "temperature": temperature,
            }
        except Exception as e:
            print(f"GPU metrics error: {e}")
            return None

    def collect_all(self) -> Dict[str, Any]:
        return {
            "timestamp": time.time(),
            "cpu": self.get_cpu_metrics(),
            "ram": self.get_ram_metrics(),
            "network": self.get_network_metrics(),
            "disk": self.get_disk_metrics(),
            "gpu": self.get_gpu_metrics(),
        }


# Global metrics collector
collector = MetricsCollector()

# Connection manager for WebSocket clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


# Background task to broadcast metrics
async def metrics_broadcaster():
    while True:
        if manager.active_connections:
            metrics = collector.collect_all()
            await manager.broadcast(json.dumps(metrics))
        await asyncio.sleep(1)  # Update every second


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize CPU percent (first call returns 0)
    psutil.cpu_percent(percpu=True)
    # Start the background broadcaster
    task = asyncio.create_task(metrics_broadcaster())
    yield
    # Shutdown
    task.cancel()
    if GPU_AVAILABLE and nvmlShutdown:
        nvmlShutdown()


app = FastAPI(title="MonitorSys API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static files directory
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "dist"


@app.get("/api/status")
async def api_status():
    return {"status": "ok", "message": "MonitorSys API is running"}


@app.get("/metrics")
async def get_metrics():
    return collector.collect_all()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, receive any messages (ping/pong handled by protocol)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# Serve static files if they exist
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/")
    async def serve_frontend():
        return FileResponse(FRONTEND_DIR / "index.html")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
