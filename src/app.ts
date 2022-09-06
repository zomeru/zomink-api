import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import xXssProtection from 'x-xss-protection';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes';
import { globalErrorHandler } from './controllers/error.controller';

dotenv.config();

const app = express();

// CORS middleware
const corsOptions = {
  origin: process.env['CLIENT_ORIGIN'],
  credentials: true,
};
app.use(cors(corsOptions));

// Headers middleware
app.use(cookieParser());
app.use(helmet());

if (process.env['NODE_ENV'] === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

if (process.env['NODE_ENV'] === 'development') {
  app.use(morgan('tiny'));
}

// limit requests from the same IP to 500 per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Protection middleware
app.use(xXssProtection());
app.use(hpp());

// Routes
app.use(router);

// Proxy middleware
const proxyOptions = {
  target: process.env['API_URL'],
  changeOrigin: true,
};
app.use('/', createProxyMiddleware(proxyOptions));

// Error handler
app.use(globalErrorHandler);

const PORT = Number(process.env['PORT']);
app.listen(PORT, () => {
  if (process.env['NODE_ENV'] === 'development') {
    log.info(PORT, typeof PORT);
    log.info(`Server started at http://localhost:${PORT}`);
  } else {
    log.info(`Server started`);
  }

  connectToDb().catch((err) => log.error(err));
});
