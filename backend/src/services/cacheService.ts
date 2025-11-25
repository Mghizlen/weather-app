import { SearchCache } from '../models/SearchCache';
import { WeatherResponse } from './openWeatherService';

/**
 * CacheService handles caching of weather API responses in MongoDB
 * Implements TTL-based expiration
 */
class CacheService {
  private cacheTTL: number;

  constructor() {
    // Default to 5 minutes (300 seconds)
    this.cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);
  }

  /**
   * Generate cache key from coordinates and units
   */
  private generateCacheKey(lat: number, lon: number, units: string): string {
    return `${lat.toFixed(4)}_${lon.toFixed(4)}_${units}`;
  }

  /**
   * Get cached weather data if it exists and is not expired
   */
  async get(
    lat: number,
    lon: number,
    units: string = 'metric'
  ): Promise<WeatherResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(lat, lon, units);
      
      const cachedData = await SearchCache.findOne({
        query: cacheKey,
        expiresAt: { $gt: new Date() }, // Only return non-expired data
      });

      if (cachedData) {
        return cachedData.response as WeatherResponse;
      }

      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null; // Return null on error, don't block the request
    }
  }

  /**
   * Store weather data in cache with expiration
   */
  async set(
    lat: number,
    lon: number,
    units: string = 'metric',
    data: WeatherResponse
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(lat, lon, units);
      const expiresAt = new Date(Date.now() + this.cacheTTL * 1000);

      // Update existing or create new cache entry
      await SearchCache.findOneAndUpdate(
        { query: cacheKey },
        {
          query: cacheKey,
          lat,
          lon,
          units,
          response: data,
          createdAt: new Date(),
          expiresAt,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Cache storage error:', error);
      // Don't throw - caching failure shouldn't break the request
    }
  }

  /**
   * Clear expired cache entries manually
   * Note: MongoDB TTL index handles this automatically, but this can be used for immediate cleanup
   */
  async clearExpired(): Promise<number> {
    try {
      const result = await SearchCache.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries (useful for testing or admin operations)
   */
  async clearAll(): Promise<number> {
    try {
      const result = await SearchCache.deleteMany({});
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
  }> {
    try {
      const totalEntries = await SearchCache.countDocuments({});
      const expiredEntries = await SearchCache.countDocuments({
        expiresAt: { $lt: new Date() },
      });
      const activeEntries = totalEntries - expiredEntries;

      return { totalEntries, expiredEntries, activeEntries };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalEntries: 0, expiredEntries: 0, activeEntries: 0 };
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
