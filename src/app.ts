import express from 'express';
import cors from 'cors';
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

const whitelist = [
  'https://zom.ink',
  'http://zom.ink',
  'https://76.76.21.21',
  'http://76.76.21.21',
  process.env.CLIENT_ORIGIN as string,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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

app.use(
  hpp({
    whitelist: [],
  })
);

app.use(deserializeUser);

app.get('/', (req, res) => {
  res.send('Zomink');
});

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
