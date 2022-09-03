import { Request, Response } from 'express';
import { omit } from 'lodash';

import { CreateShortURLInput, RedirectToLinkInput } from '../schema/url.schema';
import {
  createShortURL,
  findUrlByAlias,
  findUrlByLink,
  findUrlByUserAndLink,
  getAllUrlsByUserId,
} from '../services/url.service';
import { aliasValid, linkValid } from '../utils/regEx';
import { aliasGen } from '../utils/urls';

export const createShortURLHandler = async (
  req: Request<{}, {}, CreateShortURLInput>,
  res: Response
) => {
  const { body } = req;

  try {
    let alias = '';
    const link = body.link.trim();

    if (!linkValid(link)) {
      return res.status(400).json({
        status: 400,
        error: 'Invalid link',
      });
    }

    if (body.alias) {
      const newAlias = body.alias.toLowerCase().trim();

      const existingAlias = await findUrlByAlias(newAlias);

      if (existingAlias) {
        return res.status(400).json({
          status: 400,
          error: 'Alias already taken',
        });
      }
      if (!aliasValid(newAlias)) {
        return res.status(400).json({
          status: 400,
          error: 'Invalid alias',
        });
      }

      alias = newAlias;
    }

    if (body.user) {
      const existingUrlWithUser = await findUrlByUserAndLink(body.user, link);

      if (existingUrlWithUser) {
        return res.status(200).json({
          status: 200,
          data: {
            urlData: omit(existingUrlWithUser.toObject(), ['__v']),
          },
        });
      }
    }

    if (!body.user) {
      const shortUrlWithoutUser = await findUrlByLink(link);

      if (shortUrlWithoutUser && !shortUrlWithoutUser.user) {
        return res.status(200).json({
          status: 200,
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

    return res.status(200).json({
      status: 200,
      data: {
        urlData: omit(shortUrl.toObject(), ['__v']),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

export const getUserUrls = async (_req: Request, res: Response) => {
  const user = res.locals.token.userId;

  try {
    const urls = await getAllUrlsByUserId(user);

    return res.status(200).json({
      status: 200,
      data: {
        urls: urls.map((url) => omit(url.toObject(), ['__v'])),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

export const redirectToLinkHandler = async (
  req: Request<RedirectToLinkInput>,
  res: Response
) => {
  const { alias } = req.params;

  try {
    const url = await findUrlByAlias(alias);

    if (!url) {
      return res.status(404).json({
        status: 404,
        error: 'Url not found',
      });
    }

    return res.status(200).json({
      status: 200,
      link: url.link,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};
