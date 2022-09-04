import { object, string, TypeOf } from 'zod';
import { aliasValid, linkValid } from '../utils/regEx';

export const createShortURLSchema = object({
  body: object({
    link: string({
      required_error: 'Link is required',
    }).min(1, 'Link must be at least 6 characters long'),
    user: string().optional(),
    alias: string().optional(),
  }).refine((data) => linkValid(data.link), {
    message: 'Invalid link',
    path: ['link'],
  }),
});

export const getShortURLSchema = object({
  params: object({
    alias: string({
      required_error: 'Link not found',
    }).min(5, 'Link not found'),
  }).refine((data) => aliasValid(data.alias), {
    message: 'Link not found',
    path: ['alias'],
  }),
});

export type CreateShortURLInput = TypeOf<typeof createShortURLSchema>['body'];

export type GetShortURLInput = TypeOf<typeof getShortURLSchema>['params'];
