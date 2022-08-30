import { Request, Response } from 'express';
import { nanoid } from 'nanoid';

import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from '../schema/user.schema';
import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../services/user.service';
import log from '../utils/logger';
import sendEmail from '../utils/mailer';

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const { body } = req;

  try {
    const user = await createUser(body);

    await sendEmail({
      from: 'test@example.com',
      to: user.email,
      subject: 'Please verify your email',
      text: `Verification code: ${user.verificationCode}. ID: ${user._id}`,
    });

    return res.send('User successfully created');
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).send('An account with this email already exists');
    }

    return res.status(500).send(error);
  }
}

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const { id, verificationCode } = req.params;

  const user = await findUserById(id);

  if (!user) {
    return res.send('Could not verify user');
  }

  if (user.verified) {
    return res.send('User is already verified');
  }

  if (user.verificationCode === verificationCode) {
    user.verified = true;

    await user.save();

    return res.send('User successfully verified');
  }

  return res.send('Could not verify user');
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const message =
    'If a user with this is registered, an email will be sent to them with a password reset link';

  const { email } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    log.debug(`User with email ${email} not found`);
    return res.send(message);
  }

  if (!user.verified) {
    log.debug(`User with email ${email} is not verified`);
    return res.send(message);
  }

  const passwordResetCode = nanoid();
  user.passwordResetCode = passwordResetCode;
  await user.save();

  await sendEmail({
    to: user.email,
    from: 'test@example.com',
    subject: 'Password reset',
    text: `Password reset code: ${passwordResetCode}, User ID: ${user._id}`,
  });

  log.debug(`Password reset code sent to ${user.email}`);
  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput['params'], {}, ResetPasswordInput['body']>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;
  const { password } = req.body;

  const user = await findUserById(id);

  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send('Could not reset password');
  }

  user.passwordResetCode = null;
  user.password = password;
  await user.save();

  return res.send('Successfully updated password');
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.send(res.locals.user);
}
