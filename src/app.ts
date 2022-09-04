import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';

import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes';
import { globalErrorHandler } from './controllers/error.controller';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN as string,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(helmet());

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(router);

app.use(globalErrorHandler);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    log.info(PORT, typeof PORT);
    log.info(`Server started at http://localhost:${PORT}`);
  }

  connectToDb().catch((err) => log.error(err));
});
