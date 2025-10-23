import app from './app';
import { startWeatherScheduler } from './scheduler/weather.scheduler';
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  startWeatherScheduler();
  console.log(`Health check: http://localhost:${PORT}/health`);
});
