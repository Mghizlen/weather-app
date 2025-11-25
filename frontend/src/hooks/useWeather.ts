import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import type { WeatherResponse } from '../types/weather';

export interface WeatherState {
  data: WeatherResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch weather data
 */
export const useWeather = (
  lat: number | null,
  lon: number | null,
  units: 'metric' | 'imperial' | 'standard' = 'metric'
) => {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchWeather = useCallback(async () => {
    if (lat === null || lon === null) {
      return;
    }

    setState({ data: null, loading: true, error: null });

    try {
      const data = await apiClient.getCurrentWeather(lat, lon, units);
      setState({ data, loading: false, error: null });
      
      // Cache in localStorage for offline fallback
      localStorage.setItem(
        'lastWeatherData',
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      
      // Try to load from cache if online request fails
      const cached = localStorage.getItem('lastWeatherData');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setState({
            data: parsed.data,
            loading: false,
            error: 'Showing cached data (offline mode)',
          });
          return;
        } catch {}
      }

      setState({
        data: null,
        loading: false,
        error: error.response?.data?.error?.message || error.message || 'Failed to fetch weather data',
      });
    }
  }, [lat, lon, units]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { ...state, refetch: fetchWeather };
};
