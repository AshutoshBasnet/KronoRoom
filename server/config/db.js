import mongoose from 'mongoose';
import dns from 'dns';
import { autoSeedIfEmpty } from '../utils/autoSeed.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

let memoryServerInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-classroom';
  const isLocalUri = primaryUri.includes('127.0.0.1') || primaryUri.includes('localhost');

  try {
    console.log(`[MongoDB]: Attempting connection to ${primaryUri}...`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: isLocalUri ? 2500 : 8000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`[MongoDB Warning]: Primary database (${primaryUri}) is unreachable (${error.message}).`);
    console.log('[MongoDB]: Falling back to Standalone In-Memory Database for instant zero-config startup...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'smart-classroom'
        }
      });
      const memoryUri = memoryServerInstance.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Connected - In-Memory]: ${memoryUri}`);
      await autoSeedIfEmpty();
    } catch (memError) {
      console.error('[MongoDB Error]: Could not start in-memory database:', memError.message);
    }
  }
};

export default connectDB;
