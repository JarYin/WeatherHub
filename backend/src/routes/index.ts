import { Router } from 'express';
import weatherRoutes from './weatherRoutes';
import authRoutes from './auth';
import locationRoutes from './location';

const router = Router();

// API routes
router.use('/weather', weatherRoutes);
router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'WeatherHub API',
    version: '1.0.0',
    endpoints: {
      weather: '/api/weather',
      auth: '/api/auth',
      location: '/api/location',
      test: '/api/test',
      health: '/health',
    },
  });
});

export default router;