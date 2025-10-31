# 🌤️ WeatherHub

A modern, full-stack weather application built with Next.js and Express.js in a monorepo architecture.

## 🏗️ Project Structure

```
WeatherHub/
├── frontend/           # Next.js React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/            # Express.js API server
│   ├── src/
│   ├── package.json
│   └── ...
├── package.json        # Root monorepo configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (recommended) or Node.js 18+
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JarYin/WeatherHub.git
   cd WeatherHub
   ```

2. **Install all dependencies:**
   ```bash
   bun run install:all
   ```

3. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys
   
   # Frontend (if needed)
   cp frontend/.env.example frontend/.env.local
   ```

4. **Start development servers:**
   ```bash
   bun run dev
   ```

   This will start both:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📜 Available Scripts

### Root Level (Monorepo)
- `bun run dev` - Start both frontend and backend in development mode
- `bun run build` - Build both applications for production
- `bun run start` - Start both applications in production mode
- `bun run lint` - Run linting for both applications
- `bun run test` - Run tests for both applications
- `bun run clean` - Clean build artifacts and node_modules

### Individual Services
- `bun run dev:frontend` - Start only frontend
- `bun run dev:backend` - Start only backend
- `bun run build:frontend` - Build only frontend
- `bun run build:backend` - Build only backend

## 🔧 Development

### Frontend (Next.js)
- Location: `./frontend/`
- Port: `3000`
- Technologies: Next.js, React, TypeScript, Tailwind CSS

### Backend (Express.js)
- Location: `./backend/`
- Port: `5000`
- Technologies: Express.js, TypeScript, Bun runtime

## 📡 API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `GET /api/locations` - Fetch All Locations
- `GET /api/weather/latest` - Fetch Weather Latest
- `GET /api/weather/hourly` - Fetch Weather Hourly Latest 24 hour
- `GET /api/weather/daily` - Fetch Weather Daily
- `GET /api/weather/export/csv` - Export CSV Weather
- `GET /api/compare` - Fetch Compared Locations

- `POST /api/locations` - Create Location
- `POST /api/weather/ingest/run` - Fetch Weather Now
- `POST /api/weather/fetch` - Extract data from open-meteo and save it to the database
- `POST /api/compare` - Create Compare Locations

- `DELETE /api/locations/:id` - Delete Location
- `DELETE /api/compare/:locationId` - Delete Compare Location

- `PUT /api/locations/:id/default` - Set Default Location
- `PUT /api/locations/:id` - Update Location

## 🌍 Environment Variables

### Backend
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
WEATHER_API_KEY=your_openweathermap_api_key
DATABASE_URL="your_database_url"
DATABASE_URL_UNPOOLED=""
PGHOST=""
PGHOST_UNPOOLED=""
PGUSER=""
PGDATABASE=""
PGPASSWORD=""

POSTGRES_URL=""
POSTGRES_URL_NON_POOLING=""
POSTGRES_USER=""
POSTGRES_HOST=""
POSTGRES_PASSWORD=""
POSTGRES_DATABASE=""
POSTGRES_URL_NO_SSL=""
POSTGRES_PRISMA_URL=""

NEXT_PUBLIC_STACK_PROJECT_ID=""
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=""
STACK_SECRET_SERVER_KEY=""

JWT_EXPIRES_IN=7d
JWT_SECRET=""
```

### Frontend
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes in the appropriate folder (`frontend/` or `backend/`)
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Next.js](https://nextjs.org/) for the React framework
- [Express.js](https://expressjs.com/) for the backend framework
- [Bun](https://bun.sh/) for the fast JavaScript runtime
