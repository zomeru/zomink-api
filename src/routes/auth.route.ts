import express from 'express';

import validateResource from '../middlewares/validateResource';
import {
  loginHandler,
  logoutAllHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  alreadyLoggedInHandler,
  verifyAccessTokenHandler,
} from '../controllers/auth.controller';
import { loginSchema } from '../schema/auth.schema';
import requireUser from '../middlewares/requireUser';

const router = express.Router();

router.post(
  '/auth/login',
  [alreadyLoggedInHandler, validateResource(loginSchema)],
  loginHandler
);

router.post('/auth/refresh', refreshAccessTokenHandler);

router.post('/auth/access/:token', verifyAccessTokenHandler);

router.post('/auth/logout', requireUser, logoutHandler);

router.post('/auth/logout-all', requireUser, logoutAllHandler);

export default router;
