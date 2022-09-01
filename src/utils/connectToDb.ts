import mongoose from 'mongoose';

import log from './logger';

async function connectToDb() {
  const MONGODB_URI = process.env.MONGODB_URI as string;

  try {
    log.info('Connected to MongoDB');
    return await mongoose.connect(MONGODB_URI);
  } catch (error: any) {
    log.error('Error connecting to MongoDB', error.message);
    process.exit(1);
  }
}

export default connectToDb;
