import { DocumentType } from '@typegoose/typegoose';
import { omit } from 'lodash';

import SessionModel from '../models/session.model';
import { privateFields, User } from '../models/user.model';
import { signJwt } from '../utils/jwt';

export async function createSession({ userId }: { userId: string }) {
  return SessionModel.create({ user: userId });
}

export async function findSessionById(id: string) {
  return SessionModel.findById(id);
}

export async function signRefreshToken({ userId }: { userId: string }) {
  const session = await createSession({ userId });

  const refreshToken = signJwt(
    {
      session: session._id,
    },
    'REFRESH_TOKEN_PRIVATE_KEY',
    {
      expiresIn: '60d',
    }
  );

  return refreshToken;
}

export function signAccessToken(user: DocumentType<User>) {
  const payload = omit(user.toJSON(), privateFields);

  const accessToken = signJwt(payload, 'ACCESS_TOKEN_PRIVATE_KEY', {
    expiresIn: '15m',
  });

  return accessToken;
}
