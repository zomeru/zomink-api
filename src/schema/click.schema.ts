import { object, string, TypeOf } from 'zod';

export const saveClickSchema = object({
  body: object({
    userAgent: string({
      required_error: 'User agent is required',
    }).min(1, 'User agent is required'),
  }),
  params: object({
    urlId: string({
      required_error: 'Link not found',
    }),
  }),
});

export const infoSchema = object({
  browser: string({
    required_error: 'Browser is required',
  }),
  OS: string({
    required_error: 'OS is required',
  }),
  device: object({
    model: string({
      required_error: 'Device model is required',
    }),
    type: string({
      required_error: 'Device type is required',
    }),
  }),
  location: object({
    countryName: string({
      required_error: 'Country name is required',
    }),
    region: string({
      required_error: 'Region is required',
    }),
    city: string({
      required_error: 'City is required',
    }),
    countryCode: string({
      required_error: 'Country code is required',
    }),
  }),
});

export type SaveClickInput = TypeOf<typeof saveClickSchema>;

export type InfoInput = TypeOf<typeof infoSchema>;
