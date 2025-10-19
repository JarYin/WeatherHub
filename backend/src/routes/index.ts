import { Router } from 'express';
import weatherRoutes from './weatherRoutes.ts';
import authRoutes from './auth.ts';

const router = Router();

// API routes
router.use('/weather', weatherRoutes);
router.use('/auth', authRoutes);

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'WeatherHub API',
    version: '1.0.0',
    endpoints: {
      weather: '/api/weather',
      auth: '/api/auth',
      test: '/api/test',
      health: '/health',
    },
  });
});

export default router;