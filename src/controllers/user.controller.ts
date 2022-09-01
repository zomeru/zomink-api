import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from '../schema/user.schema';
import {
  createUser,
  // findUserByEmail,
  findUserByEmailOrUsername,
  findUserById,
} from '../services/user.service';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import log from '../utils/logger';
// import sendEmail from '../utils/mailer';

export const createUserHandler = catchAsync(
  async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { body } = req;

    try {
      const user = await createUser(body);

      // sendEmail({
      //   to: user.email,
      //   subject: 'Please verify your email',
      //   text: `Verification code: ${user.verificationCode}. ID: ${user._id}`,
      // })
      //   .then((emailRes) => {
      //     log.info(emailRes, 'Email sent');
      //   })
      //   .catch((err) => {
      //     log.error(err, 'Error sending email');
      //   });

      // return res.send('User successfully created');

      const newUser: any = user.toObject();
      delete newUser.password;
      delete newUser.verificationCode;
      delete newUser.__v;

      // return sendData(res, newUser, 200, 'success');
      return res.status(200).json({
        success: true,
        user: newUser,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return next(
          new AppError(
            'BadRequestException',
            'An account with this email or username already exists'
          )
        );
      }

      return next(new AppError('InternalServerErrorException', error.message));
    }
  }
);

export const verifyUserHandler = catchAsync(
  async (req: Request<VerifyUserInput>, res: Response, next: NextFunction) => {
    const { id, verificationCode } = req.params;

    const user = await findUserById(id);

    if (!user) {
      // return res.send('Could not verify user');

      return next(new AppError('NotFoundException', 'User not found'));
    }

    if (user.verified) {
      return next(
        new AppError('NotFoundException', 'User is already verified')
      );
    }

    if (user.verificationCode === verificationCode) {
      user.verified = true;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User successfully verified',
      });
    }

    return next(new AppError('NotFoundException', 'Could not verify user'));
  }
);

export const forgotPasswordHandler = catchAsync(
  async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
    const message =
      'If a user with this is registered, an email will be sent to them with a password reset link';

    const json = {
      success: true,
      message,
    };

    const { email } = req.body;

    // const user = await findUserByEmail(email);
    const user = await findUserByEmailOrUsername(email);

    if (!user) {
      log.debug(`User with email ${email} not found`);
      return res.status(200).json(json);
    }

    if (!user.verified) {
      log.debug(`User with email ${email} is not verified`);
      return res.status(200).json(json);
    }

    const passwordResetCode = nanoid();
    user.passwordResetCode = passwordResetCode;
    await user.save();

    await sendEmail({
      to: user.email,
      from: process.env.MAILER_FROM as string,
      subject: 'Password reset',
      text: `Password reset code: ${passwordResetCode}, User ID: ${user._id}`,
    });

    log.debug(`Password reset code sent to ${user.email}`);
    return res.status(200).json({ message });
  }
);

export const resetPasswordHandler = catchAsync(
  async (
    req: Request<ResetPasswordInput['params'], {}, ResetPasswordInput['body']>,
    res: Response,
    next: NextFunction
  ) => {
    const { id, passwordResetCode } = req.params;
    const { password } = req.body;

    const user = await findUserById(id);

    if (
      !user ||
      !user.passwordResetCode ||
      user.passwordResetCode !== passwordResetCode
    ) {
      return next(
        new AppError('BadRequestException', 'Could not reset password')
      );
    }

    user.passwordResetCode = null;
    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Successfully updated password',
    });
  }
);

export async function getCurrentUserHandler(_req: Request, res: Response) {
  const { user } = res.locals;
  // req.session.user
  return res.status(200).json({ user });
}
