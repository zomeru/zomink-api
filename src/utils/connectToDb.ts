import mongoose from 'mongoose';

import log from './logger';

async function connectToDb() {
  await mongoose.connect(process.env['MONGO_URI'] as string);
  if (process.env['NODE_ENV'] === 'development') {
    log.info('Connected to MongoDB');
  } else {
    log.info('Connected to Database');
  }
}

export default connectToDb;
