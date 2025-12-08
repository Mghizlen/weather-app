/**
 * Utility functions for the weather dashboard
 */

/**
 * Format temperature with unit
 */
export const formatTemp = (temp: number, units: 'metric' | 'imperial' | 'standard' = 'metric'): string => {
  const rounded = Math.round(temp);
  const symbol = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K';
  return `${rounded}${symbol}`;
};

/**
 * Format wind speed with unit
 */
export const formatWindSpeed = (speed: number, units: 'metric' | 'imperial' | 'standard' = 'metric'): string => {
  const rounded = Math.round(speed);
  const unit = units === 'metric' ? 'm/s' : units === 'imperial' ? 'mph' : 'm/s';
  return `${rounded} ${unit}`;
};

/**
 * Format timestamp to time string
 * @param timestamp Unix timestamp in seconds (UTC)
 * @param timezone Timezone offset in seconds from UTC
 */
export const formatTime = (timestamp: number, timezone: number = 0): string => {
  // Convert UTC timestamp to local time by adding timezone offset
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC', // Display as-is since we already adjusted for timezone
  });
};

/**
 * Format timestamp to date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get day of week from timestamp
 */
export const getDayOfWeek = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Convert wind degree to cardinal direction
 */
export const getWindDirection = (deg: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

/**
 * Get weather description capitalized
 */
export const capitalizeDescription = (description: string): string => {
  return description
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if it's day or night based on timestamp
 */
export const isDayTime = (currentTime: number, sunrise: number, sunset: number): boolean => {
  return currentTime >= sunrise && currentTime < sunset;
};

/**
 * Get background gradient based on weather condition and time
 */
export const getWeatherGradient = (weatherMain: string, isDay: boolean): string => {
  const gradients: { [key: string]: { day: string; night: string } } = {
    Clear: {
      day: 'from-blue-400 to-blue-600',
      night: 'from-gray-800 to-blue-900',
    },
    Clouds: {
      day: 'from-gray-400 to-gray-600',
      night: 'from-gray-700 to-gray-900',
    },
    Rain: {
      day: 'from-gray-500 to-blue-700',
      night: 'from-gray-800 to-blue-900',
    },
    Snow: {
      day: 'from-blue-200 to-blue-400',
      night: 'from-blue-900 to-gray-900',
    },
    Thunderstorm: {
      day: 'from-gray-600 to-gray-800',
      night: 'from-gray-900 to-black',
    },
    Drizzle: {
      day: 'from-gray-400 to-blue-500',
      night: 'from-gray-700 to-blue-800',
    },
    Mist: {
      day: 'from-gray-300 to-gray-500',
      night: 'from-gray-600 to-gray-800',
    },
  };

  const gradient = gradients[weatherMain] || gradients.Clear;
  return `bg-gradient-to-br ${isDay ? gradient.day : gradient.night}`;
};
