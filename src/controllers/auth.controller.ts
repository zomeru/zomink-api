import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
import Cookies from 'cookies';

import { CreateSessionInput } from '../schema/auth.schema';
import {
  // createSession,
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from '../services/auth.service';
import {
  // findUserByEmail,
  findUserById,
  findUserByEmailOrUsername,
} from '../services/user.service';
import { verifyJwt, VerifyJwtResult } from '../utils/jwt';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../configs';
import cookieOptions from '../utils/cookieOption';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const createSessionHandler = catchAsync(
  async (
    req: Request<{}, {}, CreateSessionInput>,
    res: Response,
    next: NextFunction
  ) => {
    const errorMessage = 'Invalid email or password';

    const { email, password } = req.body;

    // const user = await findUserByEmail(email);
    const user = await findUserByEmailOrUsername(email);

    if (!user) {
      // return res.status(401).json({ errorMessage });
      return next(new AppError('UnauthorizedException', errorMessage));
    }

    // if (!user.verified) {
    //   return res.send('Please verify your email');
    // }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      // return res.status(401).json({ errorMessage });
      return next(new AppError('UnauthorizedException', errorMessage));
    }

    // sign a access token
    const accessToken = signAccessToken(user);

    // sign a refresh token
    const refreshToken = await signRefreshToken({ userId: user._id });

    const cAT = new Cookies(req, res);
    const cFT = new Cookies(req, res);

    cAT.set('accessToken', accessToken, cookieOptions(ACCESS_TOKEN_TTL));

    cFT.set('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_TTL));

    // send tokens
    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  }
);

export const refreshAccessTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken =
      get(req, 'cookies.refreshToken') || get(req, 'headers.x-refresh');

    const { decoded } = verifyJwt(
      refreshToken,
      'REFRESH_TOKEN_PUBLIC_KEY'
    ) as VerifyJwtResult;

    if (!decoded) {
      // return res
      //   .status(401)
      //   .json({ message: 'Could not refresh access token' });
      return next(
        new AppError('UnauthorizedException', 'Could not refresh access token')
      );
    }

    const session = await findSessionById(decoded.session);

    if (!session || !session.valid) {
      return next(
        new AppError('UnauthorizedException', 'Could not refresh access token')
      );
    }

    const user = await findUserById(String(session.user));

    if (!user) {
      return next(
        new AppError('UnauthorizedException', 'Could not refresh access token')
      );
    }

    const accessToken = signAccessToken(user);

    return res.status(200).json({ accessToken });
  }
);

export const logoutHandler = catchAsync(async (req: Request, res: Response) => {
  const cookies = new Cookies(req, res);

  res.locals.user = null;

  cookies.set('accessToken', '', cookieOptions(0));
  cookies.set('refreshToken', '', cookieOptions(0));

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// export async function logoutHandler(req: Request, res: Response) {

// }
