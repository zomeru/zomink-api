import { object, string, TypeOf } from 'zod';

export const createSessionSchema = object({
  body: object({
    email: string().min(6, 'Invalid email or password'),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Invalid email or password'),
  }),
});

export type CreateSessionInput = TypeOf<typeof createSessionSchema>['body'];
