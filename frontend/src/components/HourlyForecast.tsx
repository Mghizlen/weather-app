import React from 'react';
import { WeatherIcon } from './WeatherIcon';
import type { ForecastWeather } from '../types/weather';
import { formatTemp, formatTime } from '../lib/utils';

interface HourlyForecastProps {
  forecast: ForecastWeather;
  units?: 'metric' | 'imperial' | 'standard';
}

/**
 * HourlyForecast component displays 24-hour forecast
 * Shows next 8 forecast items (24 hours in 3-hour intervals)
 */
export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  forecast,
  units = 'metric',
}) => {
  // Get next 8 items (24 hours of 3-hour intervals)
  const hourlyData = forecast?.list?.slice(0, 8) || [];

  if (!forecast || !hourlyData.length) {
    return null;
  }

  return (
    <div
      className="bg-white rounded-3xl shadow-xl p-6 animate-slide-up"
      role="region"
      aria-label="Hourly weather forecast"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6">24-Hour Forecast</h3>

      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {hourlyData.map((item, index) => {
            // Get timezone from forecast city data
            const timezone = forecast.city?.timezone || 0;
            const localTime = item.dt + timezone;
            const date = new Date(localTime * 1000);
            const hour = date.getUTCHours();
            const isDay = hour >= 6 && hour < 18;
            const time = formatTime(item.dt, timezone);

            return (
              <div
                key={item.dt}
                className="flex-shrink-0 w-24 text-center"
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                  {/* Time */}
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {index === 0 ? 'Now' : time}
                  </div>

                  {/* Weather Icon */}
                  <div className="flex justify-center mb-2">
                    <WeatherIcon
                      weatherId={item.weather[0].id}
                      weatherMain={item.weather[0].main}
                      isDay={isDay}
                      size="sm"
                    />
                  </div>

                  {/* Temperature */}
                  <div className="text-xl font-bold text-gray-800 mb-1">
                    {formatTemp(item.main.temp, units)}
                  </div>

                  {/* Precipitation */}
                  {item.pop > 0 && (
                    <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                      <span>💧</span>
                      <span>{Math.round(item.pop * 100)}%</span>
                    </div>
                  )}

                  {/* Wind Speed */}
                  <div className="text-xs text-gray-600 mt-1">
                    {Math.round(item.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="text-center text-sm text-gray-500 mt-4">
        ← Scroll for more →
      </div>
    </div>
  );
};
