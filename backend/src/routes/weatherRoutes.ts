import { Router } from 'express';
import { WeatherController } from '../controllers/weather/weatherController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = new WeatherController();
// All weather routes require authentication
router.use(authMiddleware);

// Weather CRUD routes
router.get('/latest', controller.getLatest.bind(controller));
router.get('/hourly', controller.getHourly.bind(controller));
router.get('/daily', controller.getDaily.bind(controller));
router.get('/export/csv', controller.exportCSV.bind(controller));
router.post('/ingest/run', controller.fetchWeatherNowByLocation.bind(controller));
router.post('/fetch', controller.fetchAndSaveWeather.bind(controller)); // ใช้ดึงข้อมูลจาก open-meteo

export default router;