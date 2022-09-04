import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { privateFields } from '../models/user.model';

import { LoginInput } from '../schema/auth.schema';
import { increaseTokenVersion } from '../services/auth.service';

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
  verifyRefreshToken,
} from '../utils/jwt';

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

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      data: {
        user: omit(user.toJSON(), privateFields),
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
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

export const logoutHandler = async (_req: Request, res: Response) => {
  clearTokens(res);
  return res.status(SuccessType.OK).json({
    status: SuccessType.OK,
    data: {
      message: 'Logged out successfully',
    },
  });
};

export const logoutAllHandler = async (_req: Request, res: Response) => {
  await increaseTokenVersion(res.locals.token.userId);

  clearTokens(res);
  return res.status(SuccessType.OK).json({
    status: SuccessType.OK,
    data: {
      message: 'Logged out all devices successfully',
    },
  });
};
