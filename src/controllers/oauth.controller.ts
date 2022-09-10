/* eslint-disable camelcase */
import type { Request, Response } from 'express';

import {
  findAndUpdateGoogleUser,
  findUserByEmailWithoutProvider,
  getGoogleOauthTokens,
  getGoogleUserInfo,
} from '../services/user.service';
import { encrypt } from '../utils/crypto';
import { buildTokens, setTokens } from '../utils/jwt';

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    const { id_token, access_token } = await getGoogleOauthTokens({
      code,
    });

    const googleUser = await getGoogleUserInfo({
      id_token,
      access_token,
    });

    const userInDB = await findUserByEmailWithoutProvider(googleUser.email);

    if (userInDB) {
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/auth/login?error=Email already in use. Please log in with your password.`
      );
    }

    const user = await findAndUpdateGoogleUser(
      {
        email: googleUser.email,
      },
      {
        email: googleUser.email,
        firstName: encrypt(googleUser.given_name),
        lastName: encrypt(googleUser.family_name),
        username: '',
        verified: googleUser.verified_email,
        password: '',
        authProviderId: googleUser.id,
        authProvider: 'google',
      },
      {
        upsert: true,
        new: true,
      }
    );

    const { accessToken, refreshToken } = buildTokens(user!);
    setTokens(res, accessToken, refreshToken);

    res.redirect(process.env.CLIENT_ORIGIN!);
  } catch (error) {
    return res.redirect(
      `${process.env.CLIENT_ORIGIN}/auth/login?error=Something went wrong. Please try again.`
    );
  }
};
