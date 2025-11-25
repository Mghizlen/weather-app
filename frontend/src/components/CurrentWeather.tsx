import React from 'react';
import { WeatherIcon } from './WeatherIcon';
import type { CurrentWeather } from '../types/weather';
import {
  formatTemp,
  formatWindSpeed,
  formatTime,
  capitalizeDescription,
  getWindDirection,
  isDayTime,
  getWeatherGradient,
} from '../lib/utils';

interface CurrentWeatherProps {
  weather: CurrentWeather;
  units?: 'metric' | 'imperial' | 'standard';
}

/**
 * CurrentWeather component displays current weather conditions
 */
export const CurrentWeatherDisplay: React.FC<CurrentWeatherProps> = ({
  weather,
  units = 'metric',
}) => {
  const isDay = isDayTime(weather.dt, weather.sys.sunrise, weather.sys.sunset);
  const gradient = getWeatherGradient(weather.weather[0].main, isDay);

  return (
    <div
      className={`${gradient} rounded-3xl shadow-2xl p-8 text-white animate-fade-in`}
      role="region"
      aria-label="Current weather conditions"
    >
      {/* Location and Time */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-lg opacity-90">
            {formatTime(weather.dt, weather.timezone)}
          </p>
        </div>
        <WeatherIcon
          weatherId={weather.weather[0].id}
          weatherMain={weather.weather[0].main}
          isDay={isDay}
          size="lg"
        />
      </div>

      {/* Temperature and Description */}
      <div className="mb-8">
        <div className="flex items-baseline mb-2">
          <span className="text-7xl font-bold">
            {formatTemp(weather.main.temp, units).replace(/[°CF]/g, '')}
          </span>
          <span className="text-4xl ml-2">
            {units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K'}
          </span>
        </div>
        <p className="text-2xl mb-2">
          {capitalizeDescription(weather.weather[0].description)}
        </p>
        <p className="text-lg opacity-90">
          Feels like {formatTemp(weather.main.feels_like, units)}
        </p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Humidity */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm opacity-80 mb-1">Humidity</div>
          <div className="text-2xl font-semibold">{weather.main.humidity}%</div>
        </div>

        {/* Wind */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm opacity-80 mb-1">Wind</div>
          <div className="text-2xl font-semibold">
            {formatWindSpeed(weather.wind.speed, units)}
          </div>
          <div className="text-xs opacity-70">
            {getWindDirection(weather.wind.deg)}
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm opacity-80 mb-1">Pressure</div>
          <div className="text-2xl font-semibold">{weather.main.pressure} hPa</div>
        </div>

        {/* Visibility */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm opacity-80 mb-1">Visibility</div>
          <div className="text-2xl font-semibold">
            {Math.round(weather.visibility / 1000)} km
          </div>
        </div>

        {/* Sunrise */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm opacity-80 mb-1">Sunrise</div>
          <div className="text-xl font-semibold">
            {formatTime(weather.sys.sunrise, weather.timezone)}
          </div>
        </div>

        {/* Sunset */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm opacity-80 mb-1">Sunset</div>
          <div className="text-xl font-semibold">
            {formatTime(weather.sys.sunset, weather.timezone)}
          </div>
        </div>

        {/* High/Low */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 col-span-2">
          <div className="text-sm opacity-80 mb-1">High / Low</div>
          <div className="text-xl font-semibold">
            {formatTemp(weather.main.temp_max, units)} /{' '}
            {formatTemp(weather.main.temp_min, units)}
          </div>
        </div>
      </div>
    </div>
  );
};
