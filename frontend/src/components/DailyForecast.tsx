import React from 'react';
import { WeatherIcon } from './WeatherIcon';
import type { ForecastWeather, ForecastItem } from '../types/weather';
import { formatTemp, getDayOfWeek } from '../lib/utils';

interface DailyForecastProps {
  forecast: ForecastWeather;
  units?: 'metric' | 'imperial' | 'standard';
}

/**
 * DailyForecast component displays 5-day forecast
 * Groups 3-hour forecast data by day and shows daily high/low
 */
export const DailyForecast: React.FC<DailyForecastProps> = ({
  forecast,
  units = 'metric',
}) => {
  // Group forecast items by day
  const dailyData = React.useMemo(() => {
    if (!forecast || !forecast.list || !Array.isArray(forecast.list)) {
      return [];
    }

    const grouped: { [key: string]: ForecastItem[] } = {};

    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    // Calculate daily stats
    return Object.entries(grouped).map(([date, items]) => {
      const temps = items.map((item) => item.main.temp);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);

      // Get midday weather condition (most representative)
      const middayItem = items.find((item) => {
        const hour = new Date(item.dt * 1000).getHours();
        return hour >= 12 && hour <= 15;
      }) || items[0];

      // Calculate average precipitation probability
      const avgPop = items.reduce((sum, item) => sum + item.pop, 0) / items.length;

      return {
        date: new Date(date),
        maxTemp,
        minTemp,
        weather: middayItem.weather[0],
        weatherId: middayItem.weather[0].id,
        pop: avgPop,
        humidity: middayItem.main.humidity,
        windSpeed: middayItem.wind.speed,
      };
    }).slice(0, 5); // Take first 5 days
  }, [forecast.list]);

  return (
    <div
      className="bg-white rounded-3xl shadow-xl p-6 animate-slide-up"
      role="region"
      aria-label="5-day weather forecast"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6">5-Day Forecast</h3>

      <div className="space-y-4">
        {dailyData.map((day, index) => {
          const dayName = index === 0 ? 'Today' : getDayOfWeek(day.date.getTime() / 1000);
          const isDay = true; // Use day icon for daily forecast

          return (
            <div
              key={day.date.toISOString()}
              className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              {/* Day Name */}
              <div className="w-24">
                <div className="text-lg font-semibold text-gray-800">{dayName}</div>
                <div className="text-sm text-gray-600">
                  {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Weather Icon */}
              <div className="flex-shrink-0">
                <WeatherIcon
                  weatherId={day.weatherId}
                  weatherMain={day.weather.main}
                  isDay={isDay}
                  size="md"
                />
              </div>

              {/* Weather Description */}
              <div className="flex-1 text-center px-4">
                <div className="text-sm font-medium text-gray-700 capitalize">
                  {day.weather.description}
                </div>
                {day.pop > 0.2 && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-1">
                    <span>💧</span>
                    <span>{Math.round(day.pop * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Temperature Range */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatTemp(day.maxTemp, units)}
                  </div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-600">
                    {formatTemp(day.minTemp, units)}
                  </div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="hidden md:flex flex-col items-end gap-1 ml-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>💨</span>
                  <span>{Math.round(day.windSpeed)} {units === 'metric' ? 'm/s' : 'mph'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💧</span>
                  <span>{day.humidity}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
