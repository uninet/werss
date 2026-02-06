#!/bin/bash
cd "$(dirname "$0")"
npm --prefix backend run dev &
BACKEND_PID=$!
npm --prefix frontend run dev &
FRONTEND_PID=$!

# Function to kill both processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

wait
