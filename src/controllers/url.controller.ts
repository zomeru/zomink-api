import type { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

import type {
  CreateShortURLInput,
  GetShortURLInput,
} from '../schema/url.schema';
import {
  createShortURL,
  findUrlByAlias,
  findUrlByLink,
  findUrlByUserAndLink,
  findUrlsByUserId,
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

    if (body.alias !== undefined) {
      const newAlias = body.alias.trim();

      const existingAlias = await findUrlByAlias(newAlias);

      if (existingAlias != null) {
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

    if (body.user !== undefined) {
      const existingUrlWithUser = await findUrlByUserAndLink(body.user, link);

      if (existingUrlWithUser != null) {
        // just update the timestamp
        existingUrlWithUser.updatedAt = new Date();
        const updatedUrl = await existingUrlWithUser.save();

        return res.status(SuccessType.OK).json({
          status: StatusType.Success,
          data: {
            urlData: omit(updatedUrl.toObject(), ['__v']),
          },
        });
      }
    }

    if (body.user === undefined) {
      if (body.alias !== undefined) {
        const newOjb = {
          ...body,
          alias,
          link,
          isCustomAlias: true,
        };

        const shortUrl = await createShortURL(newOjb);

        return res.status(SuccessType.Created).json({
          status: StatusType.Success,
          data: {
            urlData: omit(shortUrl.toObject(), ['__v']),
          },
        });
      }
      const shortUrlWithoutUser = await findUrlByLink(link);

      if (shortUrlWithoutUser != null && shortUrlWithoutUser.user == null) {
        return res.status(SuccessType.OK).json({
          status: StatusType.Success,
          data: {
            urlData: omit(shortUrlWithoutUser.toObject(), ['__v']),
          },
        });
      }
    }

    if (body.alias === undefined) {
      while (true) {
        const newAlias = aliasGen();
        const existingAlias = await findUrlByAlias(alias); // eslint-disable-line no-await-in-loop

        if (existingAlias == null) {
          alias = newAlias;
          break;
        }
      }
    }

    const newOjb = {
      ...body,
      alias,
      link,
      isCustomAlias: body.alias !== undefined,
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
  try {
    const urls = (await findUrlsByUserId(res.locals['token'].userId).sort({
      updatedAt: -1,
    })) as any[];

    if (urls !== undefined) {
      return next(new AppError('No urls found', ErrorType.NotFoundException));
    }

    const urlsData: any[] = urls as any[];

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      data: {
        urlData: urlsData.map((url: any) => omit(url.toObject(), ['__v'])),
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

    if (url == null) {
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
