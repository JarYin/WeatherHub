import { Router } from 'express';
import weatherRoutes from './weatherRoutes.js';
import authRoutes from './auth.js';
import locationRoutes from './location.js';
import compareRoutes from './compare.js';
import ingestJobRoutes from './ingestJob.js';

const router = Router();

// API routes
router.use('/weather', weatherRoutes);
router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/compare', compareRoutes);
router.use('/ingest-job', ingestJobRoutes);

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'WeatherHub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      location: '/api/locations',
      weather: '/api/weather', 
      compare: '/api/compare',
    },
  });
});

export default router;