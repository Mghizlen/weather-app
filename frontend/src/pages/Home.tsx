import React, { useState, useEffect } from 'react';
import { CurrentWeatherDisplay } from '../components/CurrentWeather';
import { HourlyForecast } from '../components/HourlyForecast';
import { DailyForecast } from '../components/DailyForecast';
import { SearchBar } from '../components/SearchBar';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWeather } from '../hooks/useWeather';
import { useLocalStorage } from '../hooks/useUtils';

/**
 * Home page - Main weather dashboard
 */
export const Home: React.FC = () => {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [units] = useState<'metric' | 'imperial' | 'standard'>('metric');
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);

  // Get user's geolocation
  const geoLocation = useGeolocation();

  // Fetch weather data
  const { data: weatherData, loading, error, refetch } = useWeather(lat, lon, units);

  // Use geolocation coordinates when available
  useEffect(() => {
    if (geoLocation.latitude && geoLocation.longitude && lat === null) {
      setLat(geoLocation.latitude);
      setLon(geoLocation.longitude);
    }
  }, [geoLocation.latitude, geoLocation.longitude, lat]);

  // Handle location selection from search
  const handleLocationSelect = (
    newLat: number,
    newLon: number,
    city: string,
    country: string
  ) => {
    setLat(newLat);
    setLon(newLon);

    // Add to recent searches
    const searchEntry = `${city}, ${country}`;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== searchEntry);
      return [searchEntry, ...filtered].slice(0, 5); // Keep only 5 recent
    });
  };

  // Handle use current location
  const handleUseCurrentLocation = () => {
    if (geoLocation.latitude && geoLocation.longitude) {
      setLat(geoLocation.latitude);
      setLon(geoLocation.longitude);
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">🌤️</div>
              <h1 className="text-2xl font-bold text-gray-900">Weather Dashboard</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <SearchBar onLocationSelect={handleLocationSelect} />
            </div>

            {/* Current Location Button */}
            {geoLocation.latitude && geoLocation.longitude && (
              <button
                onClick={handleUseCurrentLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                aria-label="Use current location"
              >
                <span>📍</span>
                <span className="hidden sm:inline">Current Location</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading weather data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !weatherData && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Weather</h2>
            <p className="text-red-600 mb-4">{error}</p>
            {geoLocation.error && (
              <p className="text-sm text-red-500 mb-4">{geoLocation.error}</p>
            )}
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && weatherData.current && (
          <div className="space-y-6">
            {/* Current Weather */}
            <CurrentWeatherDisplay weather={weatherData.current} units={units} />

            {/* Hourly Forecast */}
            {weatherData.forecast && (
              <HourlyForecast forecast={weatherData.forecast} units={units} />
            )}

            {/* Daily Forecast */}
            {weatherData.forecast && (
              <DailyForecast forecast={weatherData.forecast} units={units} />
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State - No Location */}
        {!loading && !weatherData && !error && !geoLocation.loading && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-6">🌍</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Weather Dashboard
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Search for a city or allow location access to get started
            </p>
            {geoLocation.error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <p className="text-yellow-800 text-sm">{geoLocation.error}</p>
                <p className="text-yellow-700 text-xs mt-2">
                  You can still search for any city using the search bar above
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>
            Weather data provided by{' '}
            <a
              href="https://openweathermap.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              OpenWeather
            </a>
          </p>
          <p className="mt-2">Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};
