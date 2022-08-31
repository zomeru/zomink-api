import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import connectToDb from './utils/connectToDb';
import log from './utils/logger';
import router from './routes';
import deserializeUser from './middlewares/deserializeUser';
import globalErrorHandler from './controllers/error.controller';

require('dotenv').config();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN as string,
  credentials: true,
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

app.listen(PORT, () => {
  log.info(`Server started at http://localhost:${PORT}`);

  connectToDb();
});
