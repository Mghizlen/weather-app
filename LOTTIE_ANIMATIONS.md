# Lottie Weather Animations Guide

This document explains how to add animated weather icons to the Weather Dashboard using Lottie animations.

## Required Animations

Download the following animations from [LottieFiles](https://lottiefiles.com/):

1. **Clear Day** - `clear-day.json`
   - [Recommended](https://lottiefiles.com/animations/sun-icon-z5uVdg1Z0g)
   - Use for weather code 800 (clear sky) during daytime

2. **Clear Night** - `clear-night.json`
   - [Recommended](https://lottiefiles.com/animations/moon-icon-animation-OIb8XPe5Pz)
   - Use for weather code 800 (clear sky) during nighttime

3. **Cloudy** - `cloudy.json`
   - [Recommended](https://lottiefiles.com/animations/cloud-icon-animated-uK0kZZoVj7)
   - Use for codes 801-804 (few clouds to overcast)

4. **Rainy** - `rainy.json`
   - [Recommended](https://lottiefiles.com/animations/rain-icon-animated-tVdxb1Q8VF)
   - Use for codes 500-531 (rain, drizzle, showers)

5. **Snowy** - `snowy.json`
   - [Recommended](https://lottiefiles.com/animations/snow-icon-animated-BjC0KQwxGJ)
   - Use for codes 600-622 (snow, sleet)

6. **Thunderstorm** - `thunderstorm.json`
   - [Recommended](https://lottiefiles.com/animations/thunder-icon-animated-XKdYZHfQAr)
   - Use for codes 200-232 (thunderstorms)

7. **Mist/Fog** - `mist.json`
   - [Recommended](https://lottiefiles.com/animations/fog-icon-animated-mN3ZxRkELK)
   - Use for codes 701-781 (mist, smoke, haze, fog)

## Installation Steps

### 1. Create Assets Directory
```bash
mkdir -p frontend/src/assets/lottie
```

### 2. Download Animations

For each animation:
1. Go to the LottieFiles link
2. Click "Download" (or "Free Download" for free animations)
3. Select "Lottie JSON" format
4. Save the file to `frontend/src/assets/lottie/` with the appropriate name

### 3. Update Icon Mapping

The animations are already mapped in `frontend/src/mapIcons.ts`. After downloading, update the import paths:

```typescript
// Example imports
import clearDay from './assets/lottie/clear-day.json';
import clearNight from './assets/lottie/clear-night.json';
import cloudy from './assets/lottie/cloudy.json';
// ... etc
```

### 4. Alternative: Use CDN Links

If you don't want to download files, you can use Lottie CDN links:

```typescript
export const weatherAnimations: Record<string, WeatherAnimation> = {
  clearDay: {
    day: 'https://assets3.lottiefiles.com/packages/lf20_xxxx.json',
    night: 'https://assets3.lottiefiles.com/packages/lf20_yyyy.json',
  },
  // ... etc
};
```

## Testing Animations

1. Start the development server:
```bash
npm run dev
```

2. Search for a city and verify animations load
3. Check browser console for any loading errors
4. Test different weather conditions

## Fallback Icons

If Lottie animations fail to load, the app automatically falls back to emoji icons:
- ☀️ Clear Day
- 🌙 Clear Night
- ☁️ Cloudy
- 🌧️ Rainy
- ❄️ Snowy
- ⛈️ Thunderstorm
- 🌫️ Mist

## OpenWeather Weather Codes

Reference for weather condition codes:
- **200-232**: Thunderstorm
- **300-321**: Drizzle
- **500-531**: Rain
- **600-622**: Snow
- **701-781**: Atmosphere (mist, fog, haze)
- **800**: Clear sky
- **801-804**: Clouds

## Troubleshooting

**Animations not loading?**
- Check file paths in `mapIcons.ts`
- Verify JSON files are valid
- Check browser console for errors
- Ensure files are in `frontend/src/assets/lottie/`

**Animations too large/slow?**
- Compress JSON files using [LottieFiles Optimizer](https://lottiefiles.com/tools/lottie-optimizer)
- Reduce animation complexity
- Use CDN links instead of local files

**Want different animations?**
1. Browse [LottieFiles Weather Category](https://lottiefiles.com/search?q=weather)
2. Download your preferred animation
3. Update `mapIcons.ts` with new file paths
4. Test in browser

## License Note

- Free Lottie animations have various licenses (check before commercial use)
- Most free animations are CC BY 4.0 (attribution required)
- Read animation license on LottieFiles before using
