import mongoose from 'mongoose';

import log from './logger';

async function connectToDb() {
  const MONGODB_URI = process.env.MONGODB_URI as string;

  try {
    await mongoose.connect(MONGODB_URI);
    log.info('Connected to MongoDB');
  } catch (error) {
    process.exit(1);
  }
}

export default connectToDb;
