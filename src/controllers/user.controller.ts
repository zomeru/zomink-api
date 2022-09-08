import type { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

import { privateFields, User } from '../models/user.model';
import type { CreateUserInput, VerifyUserInput } from '../schema/user.schema';
import {
  createUser,
  findByUserIdAndUpdate,
  findUserById,
} from '../services/user.service';
import {
  AppError,
  ErrorType,
  SuccessType,
  StatusType,
} from '../utils/appError';

import { buildTokens, setTokens } from '../utils/jwt';
import log from '../utils/logger';
import sendEmail from '../utils/sendMail';
import { encrypt, decrypt } from '../utils/crypto';

export const createUserHandler = async (
  req: Request<any, any, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  try {
    const userInfo: CreateUserInput = {
      ...body,
      firstName: encrypt(body.firstName),
      lastName: encrypt(body.lastName),
    };

    const user = await createUser(userInfo);

    const { accessToken, refreshToken } = buildTokens(user);
    setTokens(res, accessToken, refreshToken);

    const encryptedId = encrypt(`${user._id}`);

    const verifyLink = `${process.env.CLIENT_ORIGIN}/verify/${encryptedId}?token=${user.verificationCode}`;

    const mailOptions = {
      from: `Zomink <${process.env.ZOMINK_EMAIL}>`,
      to: user.email,
      subject: 'Account verification',
      template: 'email',
      context: {
        headTitle: 'Account verification',
        title: 'Verify your email address',
        description: `Hi ${decrypt(
          user.firstName
        )}, you're almost ready to start enjoying exclusive features of Zomink. Simply click the button below to verify your email address.`,
        redirectUrl: verifyLink,
        buttonText: 'Verify Email',
        optionLink: verifyLink,
      },
    };

    await sendEmail(mailOptions);

    const newUser = omit(user.toJSON(), privateFields) as User;
    const decryptedUser = {
      ...newUser,
      firstName: decrypt(newUser.firstName),
      lastName: decrypt(newUser.lastName),
    };

    return res.status(SuccessType.Created).json({
      status: StatusType.Success,
      data: {
        user: decryptedUser,
      },
    });
  } catch (error: any) {
    log.error(error);

    if (error.code === 11000) {
      return next(
        new AppError(
          `A user with this ${
            Object.keys(error.keyValue)[0] ?? 'credential'
          } already exists`,
          ErrorType.BadRequestException
        )
      );
    }

    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};

export const getCurrentUserHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await findUserById(res.locals.token.userId);

  if (!user) {
    return next(new AppError('User not found', ErrorType.NotFoundException));
  }

  const newUser = omit(user.toJSON(), privateFields) as User;
  const decryptedUser = {
    ...newUser,
    firstName: decrypt(newUser.firstName),
    lastName: decrypt(newUser.lastName),
  };

  return res.status(SuccessType.OK).json({
    status: StatusType.Success,
    data: {
      user: decryptedUser,
    },
  });
};

export const verifyUserHandler = async (
  req: Request<VerifyUserInput>,
  res: Response,
  next: NextFunction
) => {
  const { id, verificationCode } = req.params;
  const decryptedId = decrypt(id);

  try {
    const user = await findUserById(decryptedId);

    if (!user) {
      return next(new AppError('Invalid', ErrorType.BadRequestException));
    }

    if (user.verificationCode !== verificationCode) {
      return next(
        new AppError('Invalid verification link', ErrorType.BadRequestException)
      );
    }

    if (user.verified) {
      return next(
        new AppError('Already verified', ErrorType.BadRequestException)
      );
    }

    user.verified = true;
    await user.save();
    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      message: 'Verified',
    });
  } catch (error: any) {
    return next(
      new AppError(
        'We are unable to verify your email address at the moment.',
        ErrorType.BadRequestException
      )
    );
  } finally {
    await findByUserIdAndUpdate(decryptedId, {
      verificationCode: null,
    });
  }
};

//   return next(new AppError('NotFoundException', 'Could not verify user'));
// };

// export const forgotPasswordHandler = catchAsync(
//   async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
//     const message =
//       'If a user with this is registered, an email will be sent to them with a password reset link';

//     const json = {
//       success: true,
//       message,
//     };

//     const { email } = req.body;

//     // const user = await findUserByEmail(email);
//     const user = await findUserByEmailOrUsername(email);

//     if (!user) {
//       log.debug(`User with email ${email} not found`);
//       return res.status(200).json(json);
//     }

//     if (!user.verified) {
//       log.debug(`User with email ${email} is not verified`);
//       return res.status(200).json(json);
//     }

//     const passwordResetCode = nanoid();
//     user.passwordResetCode = passwordResetCode;
//     await user.save();

//     await sendEmail({
//       to: user.email,
//       from: process.env.MAILER_FROM as string,
//       subject: 'Password reset',
//       text: `Password reset code: ${passwordResetCode}, User ID: ${user._id}`,
//     });

//     log.debug(`Password reset code sent to ${user.email}`);
//     return res.status(200).json({ message });
//   }
// );

// export const resetPasswordHandler = catchAsync(
//   async (
//     req: Request<ResetPasswordInput['params'], {}, ResetPasswordInput['body']>,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const { id, passwordResetCode } = req.params;
//     const { password } = req.body;

//     const user = await findUserById(id);

//     if (
//       !user ||
//       !user.passwordResetCode ||
//       user.passwordResetCode !== passwordResetCode
//     ) {
//       return next(
//         new AppError('BadRequestException', 'Could not reset password')
//       );
//     }

//     user.passwordResetCode = null;
//     user.password = password;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Successfully updated password',
//     });
//   }
// );
