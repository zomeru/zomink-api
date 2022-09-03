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

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/test', (_req, res) => {
  res.send('Hello World!');
});

app.use(router);

app.use((_req: Request, res: Response) => {
  res.redirect(process.env.CLIENT_ORIGIN as string);
});

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    log.info(PORT, typeof PORT);
    log.info(`Server started at http://localhost:${PORT}`);
  }

  connectToDb().catch((err) => log.error(err));
});
