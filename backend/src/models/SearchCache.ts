import mongoose, { Document, Schema } from 'mongoose';

/**
 * SearchCache document interface for caching OpenWeather API responses
 */
export interface ISearchCache extends Document {
  query: string;
  lat: number;
  lon: number;
  units: string;
  response: any;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * SearchCache schema for storing weather API responses
 * Implements TTL (Time To Live) for automatic cache expiration
 */
const searchCacheSchema = new Schema<ISearchCache>(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    units: {
      type: String,
      enum: ['metric', 'imperial', 'standard'],
      default: 'metric',
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - MongoDB will automatically delete expired documents
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient cache lookups
searchCacheSchema.index({ lat: 1, lon: 1, units: 1 });
searchCacheSchema.index({ query: 1 });

export const SearchCache = mongoose.model<ISearchCache>('SearchCache', searchCacheSchema);
