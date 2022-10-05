import type { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import fetch from 'node-fetch';

import { UAParser } from 'ua-parser-js';

import type { InfoInput } from '../schema/click.schema';
import { saveClick } from '../services/click.service';
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
import { aliasValid, linkAccepted, linkValid } from '../utils/regEx';
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

    const destination = await fetch(link);

    const isLinkValid = linkValid(destination.url);
    const isLinkAccepted = await linkAccepted(destination.url);

    if (!isLinkAccepted) {
      return next(
        new AppError(
          "We're sorry but we don't accept links from this domain",
          ErrorType.BadRequestException
        )
      );
    }

    if (!linkValid(link) || !isLinkValid) {
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
  const { alias, userAgent } = req.params;

  const decodedUserAgent = decodeURIComponent(userAgent);
  let urlId = '';
  let urlData: any;

  console.log('alias', alias);
  console.log('decodedUserAgent', decodedUserAgent);

  try {
    const url = await findUrlByAlias(alias);

    if (!url) {
      return next(new AppError('Url not found', ErrorType.NotFoundException));
    }

    urlData = omit(url.toObject(), privateFields);
    urlId = url._id.toString();

    console.log('urlData', urlData);
    console.log('urlId', urlId);

    return res.status(SuccessType.OK).json({
      status: StatusType.Success,
      data: {
        url: urlData,
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  } finally {
    const locRes = await fetch('http://ip-api.com/json', {
      method: 'GET',
    });
    const locData = await locRes.json();

    const parser = new UAParser();
    parser.setUA(decodedUserAgent);

    const browser = parser.getBrowser().name;
    const OS = parser.getOS().name;
    const device = parser.getDevice();

    const info: InfoInput = {
      browser: browser || 'unknown',
      OS: OS || 'unknown',
      device: {
        model: device.model || 'unknown',
        type: device.type || 'unknown',
      },
      location: {
        countryName: locData.country || 'unknown',
        region: locData.regionName || 'unknown',
        city: locData.city || 'unknown',
        countryCode: locData.countryCode || 'unknown',
      },
    };

    console.log('finally - click info', info);

    await saveClick(urlId, info);
  }
};
