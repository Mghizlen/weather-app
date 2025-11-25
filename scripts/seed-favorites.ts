import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SavedLocation } from '../backend/src/models/SavedLocation';
import { User } from '../backend/src/models/User';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({ path: '../backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-dashboard';

/**
 * Seed script to populate database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await SavedLocation.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = await User.create({
      email: 'demo@example.com',
      password: hashedPassword,
    });
    console.log('👤 Created demo user: demo@example.com (password: demo123)');

    // Sample locations
    const sampleLocations = [
      {
        userId: demoUser._id,
        city: 'New York',
        country: 'US',
        lat: 40.7128,
        lon: -74.0060,
      },
      {
        userId: demoUser._id,
        city: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278,
      },
      {
        userId: demoUser._id,
        city: 'Tokyo',
        country: 'JP',
        lat: 35.6762,
        lon: 139.6503,
      },
      {
        userId: demoUser._id,
        city: 'Paris',
        country: 'FR',
        lat: 48.8566,
        lon: 2.3522,
      },
      {
        userId: demoUser._id,
        city: 'Sydney',
        country: 'AU',
        lat: -33.8688,
        lon: 151.2093,
      },
    ];

    // Insert sample locations
    await SavedLocation.insertMany(sampleLocations);
    console.log(`📍 Created ${sampleLocations.length} sample favorite locations`);

    console.log('');
    console.log('✅ Database seeding completed!');
    console.log('');
    console.log('Demo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');
    console.log('');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
