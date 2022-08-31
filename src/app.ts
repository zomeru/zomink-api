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

const whitelist = [
  'http://zom.ink',
  'http://zom.ink/',
  'http://www.zom.ink/',
  'http://www.zom.ink',
  'https://zomink-client.vercel.app/',
  'https://zomink-client.vercel.app',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin!) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // add more options here
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name',
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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
