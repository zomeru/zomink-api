import express from 'express';

import {
  createShortURLHandler,
  getShortURL,
  getUserUrls,
} from '../controllers/url.controller';
import requireUser from '../middlewares/requireUser';
import validateResource from '../middlewares/validateResource';
import { createShortURLSchema, getShortURLSchema } from '../schema/url.schema';

const router = express.Router();

router.post(
  '/urls',
  validateResource(createShortURLSchema),
  createShortURLHandler
);

router.get('/:alias/urls', validateResource(getShortURLSchema), getShortURL);

router.get('/urls/user', requireUser, getUserUrls);

export default router;
