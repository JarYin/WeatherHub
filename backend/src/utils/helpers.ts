/**
 * Validates if a string is a valid city name
 */
export const isValidCityName = (city: string): boolean => {
  if (!city || typeof city !== 'string') return false;
  
  // Basic validation: only letters, spaces, hyphens, and apostrophes
  const cityRegex = /^[a-zA-Z\s\-']+$/;
  return cityRegex.test(city.trim()) && city.trim().length >= 2;
};

/**
 * Converts temperature from Kelvin to Celsius
 */
export const kelvinToCelsius = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 10) / 10;
};

/**
 * Converts temperature from Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5 + 32) * 10) / 10;
};

/**
 * Formats wind direction from degrees to compass direction
 */
export const degreesToCompass = (degrees: number): string => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index] ?? '';
};

/**
 * Creates a standardized API response
 */
export const createApiResponse = (success: boolean, data?: any, error?: string) => {
  return {
    success,
    ...(data && { data }),
    ...(error && { error: { message: error } }),
    timestamp: new Date().toISOString(),
  };
};