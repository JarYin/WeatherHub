import { Router } from 'express';
import { WeatherController } from '../controllers/weather/weatherController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// All weather routes require authentication
router.use(authMiddleware);

// Weather CRUD routes
router.get('/', WeatherController.getAllWeather);
router.get('/user/stats', WeatherController.getUserStats);
router.get('/:id', WeatherController.getWeatherById);
router.post('/', WeatherController.createWeather);
router.put('/:id', WeatherController.updateWeather);
router.delete('/:id', WeatherController.deleteWeather);

export default router;