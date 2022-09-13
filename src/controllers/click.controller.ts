import type { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { UAParser } from 'ua-parser-js';

import type { InfoInput, SaveClickInput } from '../schema/click.schema';
import { saveClick } from '../services/click.service';
import { AppError, ErrorType } from '../utils/appError';

export const saveClickHandler = async (
  req: Request<SaveClickInput['params'], {}, SaveClickInput['body']>,
  res: Response,
  next: NextFunction
) => {
  const { urlId } = req.params;
  const { userAgent } = req.body;

  try {
    const locRes = await fetch('http://ip-api.com/json', {
      method: 'GET',
    });
    const locData = await locRes.json();

    const parser = new UAParser();
    parser.setUA(userAgent);

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

    const click = await saveClick(urlId, info);

    res.status(201).json({
      status: 'success',
      data: {
        click,
      },
    });
  } catch (error: any) {
    return next(
      new AppError(error.message, ErrorType.InternalServerErrorException)
    );
  }
};
