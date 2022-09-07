import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';

import { AppError } from '../utils/appError';

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      // console.log('error va', error);
      return next(new AppError(error.issues[0].message, 400));
    }
  };

export default validateResource;
