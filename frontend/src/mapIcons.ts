/**
 * Map Weatherstack weather codes to Lottie animation files
 */

// Import Lottie animations
import clearDayAnimation from './assets/lottie/Weather-sunny.json';
import clearNightAnimation from './assets/lottie/Weather-night.json';
import cloudyAnimation from './assets/lottie/partly cloudy-day-fog.json';
import rainyAnimation from './assets/lottie/rainy icon.json';
import snowyAnimation from './assets/lottie/snow icon.json';
import thunderstormAnimation from './assets/lottie/Weather-thunder.json';
import windyAnimation from './assets/lottie/Weather-windy.json';

/**
 * Get weather animation based on weather ID and conditions
 */
export const getWeatherAnimation = (
  weatherId: number,
  _weatherMain: string,
  isDay: boolean
): any => {
  // Thunderstorm (200-232)
  if (weatherId >= 200 && weatherId < 300) {
    return thunderstormAnimation;
  }

  // Drizzle (300-321)
  if (weatherId >= 300 && weatherId < 400) {
    return rainyAnimation;
  }

  // Rain (500-531)
  if (weatherId >= 500 && weatherId < 600) {
    return rainyAnimation;
  }

  // Snow (600-622)
  if (weatherId >= 600 && weatherId < 700) {
    return snowyAnimation;
  }

  // Atmosphere (701-781) - Mist, Fog, Haze, etc.
  if (weatherId >= 700 && weatherId < 800) {
    return cloudyAnimation;
  }

  // Clear (800)
  if (weatherId === 800) {
    return isDay ? clearDayAnimation : clearNightAnimation;
  }

  // Clouds (801-804)
  if (weatherId >= 801 && weatherId < 900) {
    return cloudyAnimation;
  }

  // Windy conditions
  if (weatherId >= 900) {
    return windyAnimation;
  }

  // Default
  return isDay ? clearDayAnimation : clearNightAnimation;
};

/**
 * Helper function to get weather icon description for accessibility
 */
export const getWeatherDescription = (weatherId: number, weatherMain: string): string => {
  if (weatherId >= 200 && weatherId < 300) return 'Thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'Drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'Rain';
  if (weatherId >= 600 && weatherId < 700) return 'Snow';
  if (weatherId >= 700 && weatherId < 800) return 'Mist';
  if (weatherId === 800) return 'Clear Sky';
  if (weatherId >= 801 && weatherId < 900) return 'Cloudy';
  return weatherMain;
};

/**
 * Available Lottie animations:
 * - Weather-sunny.json (Clear sky, day)
 * - Weather-night.json (Clear sky, night)
 * - partly cloudy-day-fog.json (Cloudy/Foggy)
 * - rainy icon.json (Rain, Drizzle)
 * - snow icon.json (Snow)
 * - Weather-thunder.json (Thunderstorm)
 * - Weather-windy.json (Windy conditions)
 */
