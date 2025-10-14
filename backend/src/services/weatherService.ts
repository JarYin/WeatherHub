import type { WeatherData, ForecastData, CitySearchResult } from '../models/weather.js';

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    if (!this.apiKey) {
      console.warn('⚠️  Weather API key not found. Please set WEATHER_API_KEY environment variable.');
    }
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      // Mock data for development - replace with actual API call
      const mockData: WeatherData = {
        city: city,
        country: 'US',
        temperature: 22,
        feelsLike: 25,
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        windDirection: 180,
        description: 'Partly cloudy',
        icon: '02d',
        visibility: 10,
        uvIndex: 6,
        timestamp: new Date().toISOString(),
      };

      return mockData;
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`);
    }
  }

  async getForecast(city: string, days: number = 5): Promise<ForecastData> {
    try {
      // Mock data for development - replace with actual API call
      const forecasts = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
        temperatureMax: 20 + Math.random() * 10,
        temperatureMin: 15 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        windSpeed: 10 + Math.random() * 10,
        description: 'Partly cloudy',
        icon: '02d',
        precipitationChance: Math.random() * 30,
      }));

      const mockData: ForecastData = {
        city: city,
        country: 'US',
        forecasts,
      };

      return mockData;
    } catch (error) {
      throw new Error(`Failed to fetch forecast data: ${error}`);
    }
  }

  async searchCities(query: string): Promise<CitySearchResult[]> {
    try {
      // Mock data for development - replace with actual API call
      const mockCities: CitySearchResult[] = [
        {
          name: query,
          country: 'US',
          region: 'California',
          lat: 34.0522,
          lon: -118.2437,
        },
        {
          name: `${query} Beach`,
          country: 'US',
          region: 'Florida',
          lat: 25.7617,
          lon: -80.1918,
        },
      ];

      return mockCities;
    } catch (error) {
      throw new Error(`Failed to search cities: ${error}`);
    }
  }
}