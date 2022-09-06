import express from 'express';

import validateResource from '../middlewares/validateResource';
import {
  createUserHandler,
  getCurrentUserHandler,
  verifyUserHandler,
  // forgotPasswordHandler,
  // resetPasswordHandler,
  // getCurrentUserHandler,
} from '../controllers/user.controller';
import {
  createUserSchema,
  verifyUserSchema,
  // forgotPasswordSchema,
  // resetPasswordSchema,
} from '../schema/user.schema';
import requireUser from '../middlewares/requireUser';
import { verifyUserCurrentTokenVersion } from '../controllers/auth.controller';

const router = express.Router();

router.post('/users', validateResource(createUserSchema), createUserHandler);

router.post(
  '/users/verify/:id/:verificationCode',
  validateResource(verifyUserSchema),
  verifyUserHandler
);

// router.post(
//   '/users/forgotPassword',
//   validateResource(forgotPasswordSchema),
//   forgotPasswordHandler
// );

// router.post(
//   '/users/resetPassword/:id/:passwordResetCode',
//   validateResource(resetPasswordSchema),
//   resetPasswordHandler
// );

router.get(
  '/users/me',
  [requireUser, verifyUserCurrentTokenVersion],
  getCurrentUserHandler
);

export default router;
