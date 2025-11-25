import axios, { AxiosInstance } from 'axios';

/**
 * Interface for current weather data from OpenWeather API
 */
export interface CurrentWeather {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * Interface for 5-day forecast data (3-hour intervals)
 */
export interface ForecastWeather {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
      sea_level: number;
      grnd_level: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: { all: number };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number;
    rain?: { '3h': number };
    snow?: { '3h': number };
    sys: { pod: string };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/**
 * Interface for geocoding search results
 */
export interface GeocodingResult {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Combined weather response interface
 */
export interface WeatherResponse {
  current: CurrentWeather;
  forecast: ForecastWeather;
}

/**
 * OpenWeatherService handles all interactions with the OpenWeather API
 * Implements rate limiting and error handling
 */
class OpenWeatherService {
  private apiKey: string;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;
  private requestCount: number = 0;
  private requestWindow: number = Date.now();
  private readonly maxRequestsPerMinute: number = 60;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    this.baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not defined in environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      params: {
        appid: this.apiKey,
      },
    });
  }

  /**
   * Simple rate limiter to prevent API abuse
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Reset counter if window has passed
    if (now - this.requestWindow > oneMinute) {
      this.requestCount = 0;
      this.requestWindow = now;
    }

    this.requestCount++;

    if (this.requestCount > this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  /**
   * Get current weather and 5-day forecast for coordinates
   */
  async getWeatherByCoordinates(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' | 'standard' = 'metric'
  ): Promise<WeatherResponse> {
    this.checkRateLimit();

    try {
      // Fetch current weather and forecast in parallel
      const [currentResponse, forecastResponse] = await Promise.all([
        this.axiosInstance.get<CurrentWeather>('/weather', {
          params: { lat, lon, units },
        }),
        this.axiosInstance.get<ForecastWeather>('/forecast', {
          params: { lat, lon, units },
        }),
      ]);

      return {
        current: currentResponse.data,
        forecast: forecastResponse.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OpenWeather API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search for cities by name (geocoding)
   * Returns up to 5 results
   */
  async searchCities(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    this.checkRateLimit();

    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const response = await this.axiosInstance.get<GeocodingResult[]>('/geo/1.0/direct', {
        baseURL: 'https://api.openweathermap.org',
        params: {
          q: query.trim(),
          limit: Math.min(limit, 5),
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Geocoding API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get current weather by city name
   */
  async getWeatherByCity(
    city: string,
    units: 'metric' | 'imperial' | 'standard' = 'metric'
  ): Promise<CurrentWeather> {
    this.checkRateLimit();

    try {
      const response = await this.axiosInstance.get<CurrentWeather>('/weather', {
        params: { q: city, units },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OpenWeather API error: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }
}

// Export singleton instance
export const openWeatherService = new OpenWeatherService();
