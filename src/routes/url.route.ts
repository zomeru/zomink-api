import express from 'express';

import {
  createShortURLHandler,
  getUserUrls,
  redirectToLinkHandler,
} from '../controllers/url.controller';
import requireUser from '../middlewares/requireUser';
import validateResource from '../middlewares/validateResource';
import {
  createShortURLSchema,
  redirectToLinkSchema,
} from '../schema/url.schema';

const router = express.Router();

router.post(
  '/urls',
  validateResource(createShortURLSchema),
  createShortURLHandler
);

router.get(
  '/urls/:alias',
  validateResource(redirectToLinkSchema),
  redirectToLinkHandler
);

router.get('/urls/get-user-urls', requireUser, getUserUrls);

export default router;
