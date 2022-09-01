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

app.use(
  cors({
    origin: process.env.CLIENT_URL as string,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
