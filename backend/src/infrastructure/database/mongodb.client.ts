import mongoose from 'mongoose';
import { config } from '../../shared/utils/config';

/**
 * MongoDB Connection Manager — singleton pattern.
 *
 * Why a singleton?
 * - Mongoose maintains an internal connection pool.
 * - Multiple connect() calls can exhaust database connections.
 * - In production there is only one Node process, so one connection is correct.
 * - In development, ts-node-dev re-evaluates modules on change;
 *   we track connection state to prevent duplicate connections.
 *
 * Connection lifecycle:
 * - Call connect() once during app startup (server.ts)
 * - Call disconnect() during graceful shutdown or in tests
 * - Models registered with mongoose.model() will use this connection automatically
 */

class MongoDBClient {
  private isConnected = false;

  /**
   * Establish connection to MongoDB.
   * Idempotent — safe to call multiple times.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      if (config.isDevelopment) {
        console.log('⚡ MongoDB already connected — reusing existing connection');
      }
      return;
    }

    try {
      // Mongoose 7+ has sensible defaults, minimal options needed
      await mongoose.connect(config.database.url, {
        // Useful for debugging in development
        autoIndex: config.isDevelopment,
        // Connection pool sizing (default: 100)
        maxPoolSize: 10,
        minPoolSize: 2,
        // Timeout settings
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;

      // Log connection status
      const dbName = mongoose.connection.db?.databaseName || 'unknown';
      console.log(`✅ MongoDB connected successfully to database: ${dbName}`);

      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
        this.isConnected = false;
      });

      // Enable query logging in development
      if (config.isDevelopment) {
        mongoose.set('debug', true);
      }
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Close the MongoDB connection.
   * Used during graceful shutdown and in test cleanup.
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      throw error;
    }
  }

  /**
   * Drop the entire database.
   * ⚠️  DANGEROUS — only for test cleanup, never in production!
   */
  async dropDatabase(): Promise<void> {
    if (config.isProduction) {
      throw new Error('Cannot drop database in production environment');
    }

    if (this.isConnected) {
      await mongoose.connection.dropDatabase();
      console.log('🗑️  Database dropped');
    }
  }

  /**
   * Check if connected to MongoDB.
   */
  get connected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
export const mongoDBClient = new MongoDBClient();

// Export mongoose instance for schema/model definitions
export { mongoose };
