import mongoose, { Document, Schema } from 'mongoose';

/**
 * SavedLocation document interface for user favorite locations
 */
export interface ISavedLocation extends Document {
  userId: mongoose.Types.ObjectId;
  city: string;
  country: string;
  lat: number;
  lon: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SavedLocation schema for storing user's favorite locations
 */
const savedLocationSchema = new Schema<ISavedLocation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    city: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    lon: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster user location lookups
savedLocationSchema.index({ userId: 1, createdAt: -1 });

// Prevent duplicate locations for the same user
savedLocationSchema.index({ userId: 1, lat: 1, lon: 1 }, { unique: true });

export const SavedLocation = mongoose.model<ISavedLocation>('SavedLocation', savedLocationSchema);
