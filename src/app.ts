import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';

import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes';

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL as string,
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Authorization',
      'Set-Cookie',
    ],
  })
);

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

app.use((_req: Request, res: Response) => {
  res.redirect(process.env.CLIENT_URL as string);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    log.info(`Server started at http://localhost:${PORT || 8000}`);
  }

  connectToDb();
});
