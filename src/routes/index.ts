import express from 'express';

import user from './user.route';
import auth from './auth.route';
// import newAuth from './newAuth.route';

const router = express.Router();

router.get('/healthcheck', (_, res) => res.sendStatus(200));

router.use(auth);
router.use(user);
// router.use(newAuth);

export default router;
