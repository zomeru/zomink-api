import mongoose from 'mongoose';

import log from './logger';

async function connectToDb() {
  await mongoose.connect(process.env.MONGO_URI as string);
  log.info('Connected to MongoDB');
}

export default connectToDb;
