import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  WeatherResponse,
  GeocodingResult,
  SavedLocation,
  AuthResponse,
  ApiResponse,
  ApiError as ApiErrorType,
} from '../types/weather';

/**
 * API client for weather dashboard backend
 */
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // Use environment variable or default to local development server
    const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.loadToken();

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorType>) => {
        if (error.response?.status === 401) {
          // Clear invalid token
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      this.token = stored;
    }
  }

  /**
   * Save token to localStorage
   */
  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear token from localStorage
   */
  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get current weather and forecast by coordinates
   */
  async getCurrentWeather(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' | 'standard' = 'metric'
  ): Promise<WeatherResponse> {
    const response = await this.client.get<ApiResponse<WeatherResponse>>(
      '/api/weather/current',
      {
        params: { lat, lon, units },
      }
    );
    return response.data.data;
  }

  /**
   * Search for cities
   */
  async searchCities(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await this.client.get<ApiResponse<GeocodingResult[]>>(
      '/api/weather/search',
      {
        params: { q: query },
      }
    );
    return response.data.data;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/register', {
      email,
      password,
    });
    this.saveToken(response.data.data.token);
    return response.data;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    this.saveToken(response.data.data.token);
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Get current user
   */
  async getMe(): Promise<any> {
    const response = await this.client.get('/api/auth/me');
    return response.data.data;
  }

  /**
   * Save a favorite location
   */
  async saveLocation(
    city: string,
    country: string,
    lat: number,
    lon: number
  ): Promise<SavedLocation> {
    const response = await this.client.post<ApiResponse<SavedLocation>>(
      '/api/location/save',
      {
        city,
        country,
        lat,
        lon,
      }
    );
    return response.data.data;
  }

  /**
   * Get user's favorite locations
   */
  async getFavorites(): Promise<SavedLocation[]> {
    const response = await this.client.get<ApiResponse<SavedLocation[]>>(
      '/api/location/favorites'
    );
    return response.data.data;
  }

  /**
   * Delete a favorite location
   */
  async deleteFavorite(id: string): Promise<void> {
    await this.client.delete(`/api/location/favorites/${id}`);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
