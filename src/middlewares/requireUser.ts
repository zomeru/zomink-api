import type { NextFunction, Request, Response } from 'express';

import { AppError, ErrorType } from '../utils/appError';
import { NewCookies, verifyAccessToken } from '../utils/jwt';

const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = verifyAccessToken(req.cookies[NewCookies.AccessToken]);

    if (token == null) {
      return next(
        new AppError('Unauthorized user', ErrorType.UnauthorizedException)
      );
    }

    res.locals.token = token;
    next();
  } catch (error: any) {
    return next(new AppError(error, ErrorType.BadRequestException));
  }
};

export default requireUser;
