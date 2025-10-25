#!/bin/bash

# Setup Community Solid Server with Docker
# Usage: ./scripts/setup-solid-server.sh

set -e

echo "🚀 Setting up Community Solid Server..."

# Create directories
mkdir -p solid-data
mkdir -p solid-config

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Start services
echo "📦 Starting Solid Server with Docker Compose..."
docker-compose -f docker-compose.solid.yml up -d solid-server

# Wait for server to be ready
echo "⏳ Waiting for Solid Server to be ready..."
sleep 5

# Check if server is running
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Solid Server is running!"
    echo ""
    echo "🌐 Access your Solid Server at: http://localhost:3000/"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Create an account at http://localhost:3000/"
    echo "  2. Update src/services/solidAuth.ts with your server URL"
    echo "  3. Test login in http://localhost:5176/solid-dashboard.html"
    echo ""
    echo "🛑 To stop the server: docker-compose -f docker-compose.solid.yml down"
    echo "📊 To view logs: docker-compose -f docker-compose.solid.yml logs -f solid-server"
else
    echo "❌ Solid Server failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose.solid.yml logs solid-server"
    exit 1
fi
