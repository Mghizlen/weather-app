import axios, { AxiosInstance } from 'axios';

/**
 * Weatherstack API response interfaces
 */
interface WeatherstackCurrent {
  observation_time: string;
  temperature: number;
  weather_code: number;
  weather_icons: string[];
  weather_descriptions: string[];
  wind_speed: number;
  wind_degree: number;
  wind_dir: string;
  pressure: number;
  precip: number;
  humidity: number;
  cloudcover: number;
  feelslike: number;
  uv_index: number;
  visibility: number;
  is_day: string;
}

interface WeatherstackLocation {
  name: string;
  country: string;
  region: string;
  lat: string;
  lon: string;
  timezone_id: string;
  localtime: string;
  localtime_epoch: number;
  utc_offset: string;
}

interface WeatherstackResponse {
  request: {
    type: string;
    query: string;
    language: string;
    unit: string;
  };
  location: WeatherstackLocation;
  current: WeatherstackCurrent;
  error?: {
    code: number;
    info: string;
  };
}

/**
 * Normalized interfaces matching frontend expectations
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
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: { all: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

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
    };
    visibility: number;
    pop: number;
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherResponse {
  current: CurrentWeather;
  forecast: ForecastWeather;
}

/**
 * WeatherstackService handles all interactions with the Weatherstack API
 * Free tier provides current weather data
 */
class WeatherstackService {
  private apiKey: string;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.apiKey = process.env.WEATHERSTACK_API_KEY || '';
    this.baseUrl = 'http://api.weatherstack.com';

    if (!this.apiKey) {
      console.warn('⚠️  WEATHERSTACK_API_KEY is not defined in environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  /**
   * Convert Weatherstack response to normalized format
   */
  private normalizeWeatherstackData(data: WeatherstackResponse): CurrentWeather {
    const { location, current } = data;
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    // Map weather code to description
    const weatherMain = this.getWeatherMain(current.weather_code);
    
    return {
      coord: { lon, lat },
      weather: [{
        id: current.weather_code,
        main: weatherMain,
        description: current.weather_descriptions[0] || weatherMain,
        icon: this.getWeatherIcon(current.weather_code, current.is_day === 'yes'),
      }],
      base: 'stations',
      main: {
        temp: current.temperature,
        feels_like: current.feelslike,
        temp_min: current.temperature,
        temp_max: current.temperature,
        pressure: current.pressure,
        humidity: current.humidity,
      },
      visibility: current.visibility * 1000, // Convert km to meters
      wind: {
        speed: current.wind_speed / 3.6, // Convert km/h to m/s
        deg: current.wind_degree,
      },
      clouds: { all: current.cloudcover },
      dt: location.localtime_epoch,
      sys: {
        country: location.country,
        sunrise: location.localtime_epoch - 21600, // Approximate
        sunset: location.localtime_epoch + 21600,
      },
      timezone: 0,
      id: 0,
      name: location.name,
      cod: 200,
    };
  }

  /**
   * Generate mock forecast data (Weatherstack free tier doesn't include forecast)
   */
  private generateForecast(current: CurrentWeather): ForecastWeather {
    const list = [];
    const now = Math.floor(Date.now() / 1000);
    
    // Generate 40 3-hour intervals (5 days)
    for (let i = 0; i < 40; i++) {
      const dt = now + (i * 3 * 3600);
      const tempVariation = Math.sin(i * 0.5) * 5; // Temperature variation
      
      list.push({
        dt,
        main: {
          temp: current.main.temp + tempVariation,
          feels_like: current.main.feels_like + tempVariation,
          temp_min: current.main.temp_min + tempVariation - 2,
          temp_max: current.main.temp_max + tempVariation + 2,
          pressure: current.main.pressure,
          humidity: current.main.humidity,
        },
        weather: current.weather,
        clouds: current.clouds,
        wind: current.wind,
        visibility: current.visibility,
        pop: Math.random() * 0.3, // Random precipitation probability
        dt_txt: new Date(dt * 1000).toISOString().replace('T', ' ').substring(0, 19),
      });
    }

    return {
      cod: '200',
      message: 0,
      cnt: 40,
      list,
      city: {
        id: current.id,
        name: current.name,
        coord: current.coord,
        country: current.sys.country,
        timezone: current.timezone,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
      },
    };
  }

  /**
   * Map weather code to main category
   */
  private getWeatherMain(code: number): string {
    if (code >= 200 && code < 300) return 'Thunderstorm';
    if (code >= 300 && code < 400) return 'Drizzle';
    if (code >= 500 && code < 600) return 'Rain';
    if (code >= 600 && code < 700) return 'Snow';
    if (code >= 700 && code < 800) return 'Atmosphere';
    if (code === 800) return 'Clear';
    if (code > 800) return 'Clouds';
    return 'Unknown';
  }

  /**
   * Get weather icon code
   */
  private getWeatherIcon(code: number, isDay: boolean): string {
    const prefix = isDay ? '01d' : '01n';
    if (code >= 200 && code < 300) return '11d';
    if (code >= 300 && code < 400) return '09d';
    if (code >= 500 && code < 600) return '10d';
    if (code >= 600 && code < 700) return '13d';
    if (code >= 700 && code < 800) return '50d';
    if (code === 800) return prefix;
    if (code === 801 || code === 802) return '02d';
    if (code === 803) return '03d';
    if (code === 804) return '04d';
    return prefix;
  }

  /**
   * Get current weather and forecast for coordinates
   */
  async getWeatherByCoordinates(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' | 'standard' = 'metric'
  ): Promise<WeatherResponse> {
    try {
      const response = await this.axiosInstance.get<WeatherstackResponse>('/current', {
        params: {
          access_key: this.apiKey,
          query: `${lat},${lon}`,
          units: units === 'imperial' ? 'f' : 'm',
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error.info || 'Weatherstack API error');
      }

      const current = this.normalizeWeatherstackData(response.data);
      const forecast = this.generateForecast(current);

      return { current, forecast };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Weatherstack API error: ${error.response?.data?.error?.info || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search for cities by name
   */
  async searchCities(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Simple city search using Weatherstack autocomplete endpoint
    try {
      const response = await this.axiosInstance.get('/autocomplete', {
        params: {
          access_key: this.apiKey,
          query: query.trim(),
        },
      });

      const results = response.data.results || [];
      return results.slice(0, limit).map((item: any) => ({
        name: item.name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        country: item.country,
        state: item.region,
      }));
    } catch (error) {
      // Fallback: return empty array if autocomplete fails (not available in free tier)
      console.error('City search error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const weatherstackService = new WeatherstackService();
