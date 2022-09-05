import express from 'express';

import user from './user.route';
import auth from './auth.route';
import urls from './url.route';

const router = express.Router();

router.use(auth); // domain.com/auth
router.use(user); // domain.com/users
router.use(urls); // domain.com/urls

export default router;
