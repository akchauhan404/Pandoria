#!/bin/bash

echo "🚀 AI Storyteller Setup Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm found: $(pnpm --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
pnpm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT: Don't forget to add your OpenAI API key!"
echo "   Edit backend/server.js line 12 and replace 'your-openai-api-key-here'"
echo "   with your actual OpenAI API key."
echo ""
echo "🚀 To start the application:"
echo "   1. Terminal 1: cd backend && npm start"
echo "   2. Terminal 2: cd frontend && pnpm run dev --host"
echo "   3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Read README.md for detailed instructions."

