import { DocumentType } from '@typegoose/typegoose';
import { get, omit } from 'lodash';

import SessionModel from '../models/session.model';
import { privateFields, User } from '../models/user.model';
import { signJwt, verifyJwt, VerifyJwtResult } from '../utils/jwt';
import { findUserById } from './user.service';

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
    expiresIn: '1h',
  });

  return accessToken;
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const { decoded } = verifyJwt(
    refreshToken,
    'REFRESH_TOKEN_PUBLIC_KEY'
  ) as VerifyJwtResult;

  if (!decoded || !get(decoded, 'session')) return false;

  const session = await SessionModel.findById(get(decoded, 'session'));

  if (!session || !session.valid) return false;

  if (!session.user) return false;

  const { user }: any = session.user;

  const newUser = await findUserById(user._id as string);

  if (!newUser) return false;

  const accessToken = signJwt(
    { ...newUser, session: session._id },
    'ACCESS_TOKEN_PRIVATE_KEY',
    {
      expiresIn: '15m',
    } // 15 minutes
  );

  return accessToken;
}
