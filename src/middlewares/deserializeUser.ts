import Cookies from 'cookies';
import { NextFunction, Request, Response } from 'express';
// import { get } from 'lodash';
import { ACCESS_TOKEN_TTL } from '../configs';
import { reIssueAccessToken } from '../services/auth.service';
import cookieOptions from '../utils/cookieOption';

import { verifyJwt, VerifyJwtResult } from '../utils/jwt';

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = new Cookies(req, res);

  // const accessToken =
  //   get(req, 'cookies.accessToken') ||
  //   (get(req, 'headers.authorization') || '').replace(/^Bearer\s/, '');

  const accessToken =
    req.cookies.accessToken ||
    (req.headers.authorization || '').replace(/^Bearer\s/, '');

  // const refreshToken =
  // get(req, 'cookies.refreshToken') || get(req, 'headers.x-refresh');

  const refreshToken = req.cookies.refreshToken || req.headers['x-refresh'];

  console.log('accessToken', accessToken);
  console.log('refreshToken', refreshToken);

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(
    accessToken,
    'ACCESS_TOKEN_PUBLIC_KEY'
  ) as VerifyJwtResult;

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader('x-access-token', newAccessToken);

      cookies.set(
        'accessToken',
        newAccessToken,
        cookieOptions(ACCESS_TOKEN_TTL)
      );
    }

    const { decoded: newDecoded } = verifyJwt(
      newAccessToken as string,
      'ACCESS_TOKEN_PUBLIC_KEY'
    ) as VerifyJwtResult;

    res.locals.user = newDecoded;

    return next();
  }
};

export default deserializeUser;
