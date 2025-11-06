#!/bin/bash

# EcoTrack AI - Quick Start Script

echo "🌱 EcoTrack AI - Starting Development Server"
echo "=============================================="
echo ""

echo "📋 Important: Clear Browser LocalStorage First!"
echo ""
echo "👉 Steps to clear old data:"
echo "   1. Open http://localhost:3000 in browser"
echo "   2. Press F12 to open DevTools"
echo "   3. Go to Console tab"
echo "   4. Type: localStorage.clear()"
echo "   5. Press Enter"
echo "   6. Refresh the page (Ctrl+R or Cmd+R)"
echo ""
echo "   OR"
echo ""
echo "   1. Go to Application tab in DevTools"
echo "   2. Click Local Storage → http://localhost:3000"
echo "   3. Right-click and select 'Clear'"
echo ""

echo "🚀 Starting server..."
echo ""

npm run dev
