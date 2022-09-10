import type { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

import { decrypt } from 'src/utils/crypto';
import { privateFields, User } from '../models/user.model';
import type { LoginInput } from '../schema/auth.schema';
import { updateTokenVersion } from '../services/auth.service';
import {
  findUserById,
  findUserByEmailOrUsername,
} from '../services/user.service';
import {
  AppError,
  ErrorType,
  SuccessType,
  StatusType,
} from '../utils/appError';
import {
  buildTokens,
  clearTokens,
  NewCookies,
  refreshTokens,
  setTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/jwt';

// Add return type
export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errorMessage = 'Invalid email or password';

    const { email, password } = req.body;

    const user = await findUserByEmailOrUsername(email.toLowerCase());

    if (!user) {
      return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
    }

    const { accessToken, refreshToken } = buildTokens(user);
    setTokens(res, accessToken, refreshToken);

    const newUser = omit(user.toJSON(), privateFields) as User;
    const decryptedUser = {
      ...newUser,
      firstName: decrypt(newUser.firstName),
      lastName: decrypt(newUser.lastName),
    };

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      // accessToken,
      // refreshToken,
      data: {
        user: decryptedUser,
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  clearTokens(res);
  return res.status(SuccessType.OK).json({
    status: SuccessType.OK,
    data: {
      message: 'Logged out successfully',
    },
  });
};

export const logoutAllHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = 'Something went wrong. Please try again later';
  try {
    await updateTokenVersion(res.locals.token.userId);

    clearTokens(res);
    return res.status(SuccessType.OK).json({
      status: SuccessType.OK,
      data: {
        message: 'Logged out all devices successfully',
      },
    });
  } catch (error) {
    clearTokens(res);
    return next(new AppError(message, ErrorType.InternalServerErrorException));
  }
};

export const alreadyLoggedInHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = verifyAccessToken(req.cookies[NewCookies.AccessToken]);

    if (!token) {
      return next();
    }

    const user = await findUserById(token?.userId);

    if (user) {
      return next(
        new AppError(
          'You are already logged in.',
          ErrorType.BadRequestException
        )
      );
    }
    return next();
  } catch (error: any) {
    return next();
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorMessage = 'Unauthorized user';

  try {
    const current = verifyRefreshToken(req.cookies[NewCookies.RefreshToken]);
    const user = await findUserById(current.userId);
    if (!user) {
      return next(new AppError(errorMessage, ErrorType.BadRequestException));
    }

    const { accessToken, refreshToken } = refreshTokens(
      current,
      user.tokenVersion
    );

    setTokens(res, accessToken, refreshToken);
  } catch (error: any) {
    clearTokens(res);
    return next(new AppError(errorMessage, ErrorType.BadRequestException));
  }
};

export const verifyUserCurrentTokenVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorMessage = 'Unauthorized user';

  try {
    const current = verifyRefreshToken(req.cookies[NewCookies.RefreshToken]);
    const user = await findUserById(current.userId);

    if (!user) {
      return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
    }

    if (user.tokenVersion !== current.tokenVersion) {
      clearTokens(res);
      return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
    }

    next();
  } catch (error) {
    clearTokens(res);
    return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
  }
};

export const verifyAccessTokenHandler = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.params;
  const errorMessage = 'Unauthorized user';

  try {
    const current = verifyAccessToken(token);

    if (!current) {
      return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
    }

    const user = await findUserById(current?.userId);

    if (!user) {
      return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
    }

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
    });
  } catch (error) {
    clearTokens(res);
    return next(new AppError(errorMessage, ErrorType.UnauthorizedException));
  }
};
