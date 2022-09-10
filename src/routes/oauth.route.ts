import express from 'express';

import { googleOAuthHandler } from '../controllers/oauth.controller';

const router = express.Router();

router.get('/oauth/google', googleOAuthHandler);

export default router;
