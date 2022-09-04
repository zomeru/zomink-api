import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { privateFields } from '../models/user.model';
// import UserModel from '../models/user.model';

import {
  CreateUserInput,
  // ForgotPasswordInput,
  // ResetPasswordInput,
  // VerifyUserInput,
} from '../schema/user.schema';
import {
  createUser,
  findUserById,
  // findUserByEmail,
  // findUserByEmailOrUsername,
  // findUserById,
} from '../services/user.service';
import {
  AppError,
  ErrorType,
  SuccessType,
  StatusType,
} from '../utils/appError';

import { buildTokens, setTokens } from '../utils/jwt';

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  try {
    const user = await createUser(body);

    const { accessToken, refreshToken } = buildTokens(user);
    setTokens(res, accessToken, refreshToken);

    return res.status(SuccessType.Created).json({
      status: StatusType.Success,
      data: {
        user: omit(user.toJSON(), privateFields),
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(
        new AppError(
          `A user with this ${Object.keys(error.keyValue)[0]} already exists`,
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

  return res.status(SuccessType.OK).json({
    status: StatusType.Success,
    data: {
      user: omit(user.toObject(), privateFields),
    },
  });
};

// export const verifyUserHandler = catchAsync(
//   async (req: Request<VerifyUserInput>, res: Response, next: NextFunction) => {
//     const { id, verificationCode } = req.params;

//     const user = await findUserById(id);

//     if (!user) {
//       // return res.send('Could not verify user');

//       return next(new AppError('NotFoundException', 'User not found'));
//     }

//     if (user.verified) {
//       return next(
//         new AppError('NotFoundException', 'User is already verified')
//       );
//     }

//     if (user.verificationCode === verificationCode) {
//       user.verified = true;

//       await user.save();

//       return res.status(200).json({
//         success: true,
//         message: 'User successfully verified',
//       });
//     }

//     return next(new AppError('NotFoundException', 'Could not verify user'));
//   }
// );

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

// export async function getCurrentUserHandler(
//   _req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   // const { user } = res.locals;
//   // req.session.user
//   // return res.status(200).json({ user });

//   const user = await UserModel.findById(res.locals.token.userId);
//   if (!user) {
//     return next(new AppError('NotFoundException', 'User Not Found'));
//   }

//   return res.status(200).json({
//     success: true,
//     user,
//   });
// }
