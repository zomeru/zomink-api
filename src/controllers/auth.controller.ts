import { Request, Response } from 'express';

import { LoginInput } from '../schema/auth.schema';
import { increaseTokenVersion } from '../services/auth.service';

import {
  findUserById,
  findUserByEmailOrUsername,
} from '../services/user.service';

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
  res: Response
) => {
  try {
    const errorMessage = 'Invalid email or password';

    const { email, password } = req.body;

    const user = await findUserByEmailOrUsername(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        status: 401,
        error: errorMessage,
      });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        error: errorMessage,
      });
    }

    const { accessToken, refreshToken } = buildTokens(user);
    setTokens(res, accessToken, refreshToken);

    // // send tokens
    return res.status(200).json({
      status: 200,
      data: {
        user,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const current = verifyRefreshToken(req.cookies[NewCookies.RefreshToken]);
    const user = await findUserById(current.userId);
    if (!user) {
      return res.json({
        status: 400,
        error: 'Invalid refresh token',
      });
    }

    const { accessToken, refreshToken } = refreshTokens(
      current,
      user.tokenVersion
    );
    setTokens(res, accessToken, refreshToken);
  } catch (error: any) {
    clearTokens(res);
    return res.json({
      status: 500,
      error: 'Invalid refresh token',
    });
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  clearTokens(res);
  return res.json({
    status: 200,
    message: 'Logged out successfully',
  });
};

export const logoutAllHandler = async (_req: Request, res: Response) => {
  await increaseTokenVersion(res.locals.token.userId);

  clearTokens(res);
  return res.status(200).json({
    status: 200,
    message: 'Logged out all devices successfully',
  });
};
