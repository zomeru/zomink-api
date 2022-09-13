import type { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

import { privateFields } from '../models/url.model';
import type {
  CreateShortURLInput,
  GetShortURLInput,
} from '../schema/url.schema';
import {
  createShortURL,
  findUrlByAlias,
  findUrlByLink,
  findUrlByUserAndLink,
  findUrlByUserAndLinkAndAlias,
  findUrlsByUserId,
} from '../services/url.service';
import {
  AppError,
  ErrorType,
  StatusType,
  SuccessType,
} from '../utils/appError';
import { aliasValid, linkValid } from '../utils/regEx';
import { aliasGen, removeForwardSlash } from '../utils/urls';

export const createShortURLHandler = async (
  req: Request<{}, {}, CreateShortURLInput>,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  try {
    let alias = '';
    const link = removeForwardSlash(body.link.trim());

    if (!linkValid(link)) {
      return next(new AppError('Invalid link', ErrorType.BadRequestException));
    }

    if (body.alias) {
      const newAlias = body.alias.trim();

      const existingAlias = await findUrlByAlias(newAlias);

      if (existingAlias) {
        return next(
          new AppError('Alias already taken', ErrorType.BadRequestException)
        );
      }
      if (!aliasValid(newAlias)) {
        return next(
          new AppError(
            'Alias must be 5 alphanumeric characters',
            ErrorType.BadRequestException
          )
        );
      }

      alias = newAlias;
    }

    if (!body.user) {
      if (body.alias) {
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
            urlData: omit(shortUrl.toObject(), privateFields),
          },
        });
      }
      const shortUrlWithoutUser = await findUrlByLink(link);

      if (shortUrlWithoutUser && !shortUrlWithoutUser.user) {
        return res.status(SuccessType.OK).json({
          status: StatusType.Success,
          data: {
            urlData: omit(shortUrlWithoutUser.toObject(), privateFields),
          },
        });
      }
    }

    if (!body.alias) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const newAlias = aliasGen();
        const existingAlias = await findUrlByAlias(alias); // eslint-disable-line no-await-in-loop

        if (!existingAlias) {
          alias = newAlias;
          break;
        }
      }
    }

    if (body.user) {
      let existingUrlWithUser;
      if (body.alias) {
        existingUrlWithUser = await findUrlByUserAndLinkAndAlias(
          body.user,
          link,
          alias
        );
      } else {
        existingUrlWithUser = await findUrlByUserAndLink(body.user, link);
      }

      if (existingUrlWithUser) {
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

    const newOjb = {
      ...body,
      alias,
      link,
      isCustomAlias: !!body.alias,
    };

    const shortUrl = await createShortURL(newOjb);

    return res.status(SuccessType.Created).json({
      status: StatusType.Success,
      data: {
        urlData: omit(shortUrl.toObject(), privateFields),
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
    const urls = (await findUrlsByUserId(res.locals.token.userId).sort({
      updatedAt: -1,
    })) as any[];

    if (!urls) {
      return next(new AppError('No url found', ErrorType.NotFoundException));
    }

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      data: {
        urlData: urls.map((url: any) => omit(url.toObject(), privateFields)),
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};

export const getShortURL = async (
  req: Request<GetShortURLInput, any>,
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
      data: {
        url: omit(url.toObject(), privateFields),
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};
