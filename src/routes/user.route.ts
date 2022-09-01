import express from 'express';

import validateResource from '../middlewares/validateResource';
import {
  createUserHandler,
  getCurrentUserHandler,
  // forgotPasswordHandler,
  // verifyUserHandler,
  // resetPasswordHandler,
  // getCurrentUserHandler,
} from '../controllers/user.controller';
import {
  createUserSchema,
  // forgotPasswordSchema,
  // resetPasswordSchema,
  // verifyUserSchema,
} from '../schema/user.schema';
import requireUser from '../middlewares/requireUser';

const router = express.Router();

router.post('/users', validateResource(createUserSchema), createUserHandler);

// router.post(
//   '/users/verify/:id/:verificationCode',
//   validateResource(verifyUserSchema),
//   verifyUserHandler
// );

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

router.get('/users/me', requireUser, getCurrentUserHandler);

export default router;
