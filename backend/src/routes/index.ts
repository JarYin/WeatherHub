import { Router } from 'express';
import weatherRoutes from './weatherRoutes';
import authRoutes from './auth';
import locationRoutes from './location';
import compareRoutes from './compare';

const router = Router();

// API routes
router.use('/weather', weatherRoutes);
router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/compare', compareRoutes)

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'WeatherHub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      location: '/api/location',
      weather: '/api/weather', 
      compare: '/api/compare',
    },
  });
});

export default router;