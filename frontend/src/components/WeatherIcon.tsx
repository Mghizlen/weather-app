import React from 'react';
import Lottie from 'lottie-react';
import { getWeatherAnimation } from '../mapIcons';

interface WeatherIconProps {
  weatherId: number;
  weatherMain: string;
  isDay: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * WeatherIcon component displays animated Lottie weather icons
 * Falls back to emoji if Lottie fails to load
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({
  weatherId,
  weatherMain,
  isDay,
  size = 'md',
  className = '',
}) => {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const animation = getWeatherAnimation(weatherId, weatherMain, isDay);

  // Fallback emoji icons
  const emojiIcon = () => {
    if (weatherMain === 'Clear') return isDay ? '☀️' : '🌙';
    if (weatherMain === 'Clouds') return '☁️';
    if (weatherMain === 'Rain') return '🌧️';
    if (weatherMain === 'Drizzle') return '🌦️';
    if (weatherMain === 'Thunderstorm') return '⛈️';
    if (weatherMain === 'Snow') return '❄️';
    if (weatherMain === 'Mist' || weatherMain === 'Fog') return '🌫️';
    return '🌤️';
  };

  if (error || !animation) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} flex items-center justify-center text-4xl`}
        role="img"
        aria-label={weatherMain}
      >
        {emojiIcon()}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`} aria-label={weatherMain}>
      <Lottie
        animationData={animation}
        loop={true}
        autoplay={true}
        onError={() => setError(true)}
      />
    </div>
  );
};
