#!/bin/bash

# EcoTrack AI - Quick Start Script

echo "🌍 EcoTrack AI - Quick Start"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. You can configure Firebase later."
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "The app will open at http://localhost:3000"
echo ""
echo "📝 Quick Tips:"
echo "   - The app works offline with LocalStorage (no Firebase needed)"
echo "   - Configure Firebase in .env for cloud sync"
echo "   - Press Ctrl+C to stop the server"
echo ""

npm run dev
