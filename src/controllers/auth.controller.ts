import { Request, Response } from 'express';
import { get } from 'lodash';

import { CreateSessionInput } from '../schema/auth.schema';
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from '../services/auth.service';
import { findUserByEmail, findUserById } from '../services/user.service';
import { verifyJwt } from '../utils/jwt';

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const errorMessage = 'Invalid email or password';

  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) {
    return res.send(errorMessage);
  }

  if (!user.verified) {
    return res.send('Please verify your email');
  }

  const isValidPassword = await user.validatePassword(password);

  if (!isValidPassword) {
    return res.send(errorMessage);
  }

  // sign a access token
  const accessToken = signAccessToken(user);

  // sign a refresh token
  const refreshToken = await signRefreshToken({ userId: user._id });

  // send tokens
  return res.send({
    accessToken,
    refreshToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = get(req, 'headers.x-refresh');

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    'REFRESH_TOKEN_PUBLIC_KEY'
  );

  if (!decoded) {
    return res.status(401).send('Could not refresh access token');
  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).send('Could not refresh access token');
  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send('Could not refresh access token');
  }

  const accessToken = signAccessToken(user);

  return res.send({ accessToken });
}
