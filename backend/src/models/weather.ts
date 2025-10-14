export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  visibility: number;
  uvIndex: number;
  timestamp: string;
}

export interface ForecastData {
  city: string;
  country: string;
  forecasts: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  precipitationChance: number;
}

export interface CitySearchResult {
  name: string;
  country: string;
  region?: string;
  lat: number;
  lon: number;
}