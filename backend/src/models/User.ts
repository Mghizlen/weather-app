import mongoose, { Document, Schema } from 'mongoose';

/**
 * User document interface
 */
export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema for authentication
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
