#!/bin/bash

# Hacklahoma Server Startup Script
# Starts both the main API server and the admin GUI

echo "🐝 Starting Hacklahoma Servers..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start main API server in background
echo "🚀 Starting main API server (port 5001)..."
cd /Users/bryan/git/HacklahomaSite2026/server
npm run dev &
API_PID=$!

# Wait a moment for the API server to start
sleep 3

# Start admin GUI server in background
echo "🎨 Starting admin GUI server (port 5002)..."
cd /Users/bryan/git/HacklahomaSite2026/server/admin-gui
npm start &
GUI_PID=$!

# Wait a moment for both servers to start
sleep 3

echo ""
echo "✅ Both servers started successfully!"
echo ""
echo "📊 Main API Server: http://localhost:5001"
echo "🎛️  Admin GUI: http://localhost:5002"
echo "🔑 Admin Secret: (configured in admin-gui/.env)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes to finish
wait
