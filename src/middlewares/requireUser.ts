import { NextFunction, Request, Response } from 'express';
import { NewCookies, verifyAccessToken } from '../utils/jwt';

const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = verifyAccessToken(req.cookies[NewCookies.AccessToken]);

    if (!token) {
      return res.json({
        status: 401,
        error: 'Unauthorized user. Please login',
      });
    }

    res.locals.token = token;

    next();
  } catch (error) {
    return res.json({
      status: 500,
      error,
    });
  }
};

export default requireUser;
