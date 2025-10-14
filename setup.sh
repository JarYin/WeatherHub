#!/bin/bash

# WeatherHub Development Setup Script

echo "🌤️  Setting up WeatherHub development environment..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun from https://bun.sh"
    exit 1
fi

echo "✅ Bun found"

# Install dependencies for all packages
echo "📦 Installing dependencies..."

echo "  → Installing root dependencies..."
bun install

echo "  → Installing frontend dependencies..."
cd frontend && bun install

echo "  → Installing backend dependencies..."
cd ../backend && bun install

echo "  → Going back to root..."
cd ..

# Setup environment files
echo "🔧 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "  → Created backend/.env from template"
    echo "  ⚠️  Please edit backend/.env with your API keys"
else
    echo "  → backend/.env already exists"
fi

# Display helpful information
echo ""
echo "🚀 Setup complete! Here's what you can do:"
echo ""
echo "Development commands:"
echo "  bun run dev                 # Start both frontend and backend"
echo "  bun run dev:frontend        # Start only frontend (port 3000)"
echo "  bun run dev:backend         # Start only backend (port 5000)"
echo ""
echo "Build commands:"
echo "  bun run build               # Build both applications"
echo "  bun run build:frontend      # Build only frontend"
echo "  bun run build:backend       # Build only backend"
echo ""
echo "Other commands:"
echo "  bun run lint                # Lint both applications"
echo "  bun run test                # Test both applications"
echo "  bun run clean               # Clean build artifacts"
echo ""
echo "🌍 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  API Docs: http://localhost:5000/api"
echo "  Health:   http://localhost:5000/health"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your OpenWeatherMap API key"
echo "2. Run 'bun run dev' to start development servers"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🎉"