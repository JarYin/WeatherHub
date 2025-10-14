# WeatherHub Backend

A robust Express.js backend API for the WeatherHub weather application built with TypeScript and Bun.

## 🚀 Features

- **Express.js** framework with TypeScript
- **Modular architecture** with controllers, services, and routes
- **Security middleware** (Helmet, CORS)
- **Error handling** with custom error middleware
- **Weather API integration** ready
- **Health check endpoint**
- **Request logging** with Morgan
- **Environment configuration** with dotenv

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   └── weatherController.ts
│   ├── middleware/          # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── models/              # TypeScript interfaces
│   │   └── weather.ts
│   ├── routes/              # API route definitions
│   │   ├── index.ts
│   │   └── weather.ts
│   ├── services/            # Business logic
│   │   └── weatherService.ts
│   ├── utils/               # Helper functions
│   │   └── helpers.ts
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server startup
├── .env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠 Installation

```bash
bun install
```

## 🔧 Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
WEATHER_API_KEY=your_openweathermap_api_key_here
```

## 🏃 Running the Application

### Development
```bash
bun run dev
```

### Production Build
```bash
bun run build
bun run start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Weather API
- `GET /api/weather/current/:city` - Get current weather for a city
- `GET /api/weather/forecast/:city?days=5` - Get weather forecast
- `GET /api/weather/search/:query` - Search for cities

### API Info
- `GET /api` - API information and available endpoints

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Request size limits** - Body parser limits
- **Error sanitization** - Production error handling

## 🧪 Testing

```bash
bun test
```

## 📝 Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run test` - Run tests

## 🌐 Weather API Integration

The application is ready to integrate with OpenWeatherMap API. To get started:

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add it to your `.env` file as `WEATHER_API_KEY`

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add appropriate error handling
4. Update tests for new features

This project was created using Bun v1.2.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
