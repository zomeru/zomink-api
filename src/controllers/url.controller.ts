import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

import { CreateShortURLInput, GetShortURLInput } from '../schema/url.schema';
import {
  createShortURL,
  findUrlByAlias,
  findUrlByLink,
  findUrlByUserAndLink,
  getAllUrlsByUserId,
} from '../services/url.service';
import {
  AppError,
  ErrorType,
  StatusType,
  SuccessType,
} from '../utils/appError';
import { aliasValid, linkValid } from '../utils/regEx';
import { aliasGen } from '../utils/urls';

export const createShortURLHandler = async (
  req: Request<{}, {}, CreateShortURLInput>,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  try {
    let alias = '';
    const link = body.link.trim();

    if (!linkValid(link)) {
      return next(new AppError('Invalid link', ErrorType.BadRequestException));
    }

    if (body.alias) {
      const newAlias = body.alias.toLowerCase().trim();

      const existingAlias = await findUrlByAlias(newAlias);

      if (existingAlias) {
        return next(
          new AppError('Alias already taken', ErrorType.BadRequestException)
        );
      }
      if (!aliasValid(newAlias)) {
        return next(
          new AppError('Invalid alias', ErrorType.BadRequestException)
        );
      }

      alias = newAlias;
    }

    if (body.user) {
      const existingUrlWithUser = await findUrlByUserAndLink(body.user, link);

      if (existingUrlWithUser) {
        return res.status(SuccessType.OK).json({
          status: StatusType.Success,
          data: {
            urlData: omit(existingUrlWithUser.toObject(), ['__v']),
          },
        });
      }
    }

    if (!body.user) {
      const shortUrlWithoutUser = await findUrlByLink(link);

      if (shortUrlWithoutUser && !shortUrlWithoutUser.user) {
        return res.status(SuccessType.OK).json({
          status: StatusType.Success,
          data: {
            urlData: omit(shortUrlWithoutUser.toObject(), ['__v']),
          },
        });
      }
    }

    if (!body.alias) {
      while (true) {
        const newAlias = aliasGen();
        const existingAlias = await findUrlByAlias(alias); // eslint-disable-line no-await-in-loop

        if (!existingAlias) {
          alias = newAlias;
          break;
        }
      }
    }

    const newOjb = {
      ...body,
      alias,
      link,
    };

    const shortUrl = await createShortURL(newOjb);

    return res.status(SuccessType.Created).json({
      status: StatusType.Success,
      data: {
        urlData: omit(shortUrl.toObject(), ['__v']),
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};

export const getUserUrls = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.token.userId;

  try {
    const urls = await getAllUrlsByUserId(user);

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      data: {
        urls: urls.map((url) => omit(url.toObject(), ['__v'])),
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};

export const getShortURL = async (
  req: Request<GetShortURLInput>,
  res: Response,
  next: NextFunction
) => {
  const { alias } = req.params;

  try {
    const url = await findUrlByAlias(alias);

    if (!url) {
      return next(new AppError('Url not found', ErrorType.NotFoundException));
    }

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      link: url.link,
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};
