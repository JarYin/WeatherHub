import { Router } from 'express';
import weatherRoutes from './weather.ts';

const router = Router();

// API routes
router.use('/weather', weatherRoutes);

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'WeatherHub API',
    version: '1.0.0',
    endpoints: {
      weather: '/api/weather',
      health: '/health',
    },
  });
});

export default router;