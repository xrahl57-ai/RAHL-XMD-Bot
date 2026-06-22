import mongoose from 'mongoose';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectMongoDB() {
  if (!config.mongoUri) {
    logger.warn('MONGODB_URI not set — database features disabled.');
    return false;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info('MongoDB connected successfully.');
    return true;
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    throw err;
  }
}

export function getConnectionStatus() {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  };
}
