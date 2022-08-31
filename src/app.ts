import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes';
import deserializeUser from './middlewares/deserializeUser';
import globalErrorHandler from './controllers/error.controller';

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  hpp({
    whitelist: [],
  })
);

app.use(deserializeUser);

app.use('/api', router);

app.use(globalErrorHandler);

const { PORT } = process.env;

const isDev = process.env.NODE_ENV === 'development';

app.listen(PORT, () => {
  log.info(
    `Server started at ${isDev ? 'http://localhost' : 'https://zom.ink'}:${
      PORT || 8000
    }`
  );

  connectToDb();
});
