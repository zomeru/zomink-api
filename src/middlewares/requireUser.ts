import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';

const requireUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;

    if (!user) {
      return res.sendStatus(403);
    }

    return next();
  }
);

export default requireUser;
