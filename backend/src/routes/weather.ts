import { Router } from 'express';
import { WeatherController } from '../controllers/weatherController.ts';

const router = Router();
const weatherController = new WeatherController();

// Weather routes
router.get('/current/:city', weatherController.getCurrentWeather);
router.get('/forecast/:city', weatherController.getForecast);
router.get('/search/:query', weatherController.searchCities);

export default router;