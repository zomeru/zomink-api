import express from 'express';

import validateResource from '../middlewares/validateResource';
import {
  createSessionHandler,
  logoutHandler,
  refreshAccessTokenHandler,
} from '../controllers/auth.controller';
import { createSessionSchema } from '../schema/auth.schema';

const router = express.Router();

router.post(
  '/session',
  validateResource(createSessionSchema),
  createSessionHandler
);

router.post('/session/refresh', refreshAccessTokenHandler);

router.post('/session/logout', logoutHandler);

export default router;
