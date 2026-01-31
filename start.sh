#!/bin/bash

# MonitorSys Startup Script
# Starts the backend server which also serves the frontend

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo "        MonitorSys - System Monitor"
echo "========================================"
echo ""

# Build frontend if needed
if [ ! -d "$PROJECT_DIR/frontend/dist" ]; then
    echo "Building frontend..."
    cd "$PROJECT_DIR/frontend"
    npm run build
    echo ""
fi

# Start backend (serves both API and frontend)
echo "Starting server..."
cd "$PROJECT_DIR/backend"
. venv/bin/activate

echo ""
echo "========================================"
echo "  MonitorSys is running!"
echo "  Open: http://localhost:8000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000
