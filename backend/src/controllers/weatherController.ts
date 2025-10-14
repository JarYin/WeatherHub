import type { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weatherService.ts';

export class WeatherController {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }

  getCurrentWeather = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { city } = req.params;
      
      if (!city) {
        res.status(400).json({
          success: false,
          error: { message: 'City parameter is required' }
        });
        return;
      }

      const weatherData = await this.weatherService.getCurrentWeather(city);
      
      res.json({
        success: true,
        data: weatherData
      });
    } catch (error) {
      next(error);
    }
  };

  getForecast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { city } = req.params;
      const { days = '5' } = req.query;

      if (!city) {
        res.status(400).json({
          success: false,
          error: { message: 'City parameter is required' }
        });
        return;
      }

      const forecastData = await this.weatherService.getForecast(city, parseInt(days as string));
      
      res.json({
        success: true,
        data: forecastData
      });
    } catch (error) {
      next(error);
    }
  };

  searchCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.params;

      if (!query) {
        res.status(400).json({
          success: false,
          error: { message: 'Search query is required' }
        });
        return;
      }

      const cities = await this.weatherService.searchCities(query);
      
      res.json({
        success: true,
        data: cities
      });
    } catch (error) {
      next(error);
    }
  };
}