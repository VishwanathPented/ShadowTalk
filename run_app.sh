#!/bin/bash
# Wrapper script to run the application

# Start Backend
echo "Starting Backend..."
cd backend
if command -v mvn &> /dev/null; then
    mvn spring-boot:run &
    BACKEND_PID=$!
else
    echo "Maven not found. Please install Maven or use ./mvnw if available."
    exit 1
fi

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
