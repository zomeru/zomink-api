import { RequestHandler } from 'express';

const catchAsync = (fn: Function): RequestHandler => {
  return (req, res, next): void => {
    fn(req, res, next).catch((err: any) => {
      res.status(500).send({
        error: err.message,
      });
      next();
    });
  };
};

export default catchAsync;
