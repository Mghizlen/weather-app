#!/bin/bash

# Script to start both backend and frontend servers for local development
# Usage: ./scripts/run-local.sh

echo "🚀 Starting MERN Weather Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            echo "✅ MongoDB is running"
        else
            echo "⚠️  MongoDB is not running. Please start MongoDB:"
            echo "   - macOS/Linux: sudo systemctl start mongod"
            echo "   - Or use MongoDB Atlas (cloud)"
        fi
    else
        echo "⚠️  MongoDB not found locally. Make sure you're using MongoDB Atlas or install MongoDB."
    fi
}

# Check MongoDB
check_mongodb
echo ""

# Navigate to backend and install dependencies if needed
echo "📦 Setting up backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found in backend/"
    echo "📝 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your OPENWEATHER_API_KEY"
    echo "   Get your free API key at: https://openweathermap.org/api"
fi

# Start backend server in background
echo "🚀 Starting backend server on port 5000..."
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Navigate to frontend and install dependencies if needed
echo ""
echo "📦 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend server
echo "🚀 Starting frontend server on port 5173..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting..."
echo ""
echo "📡 Backend:  http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo "🏥 Health:   http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Wait for both processes
wait
