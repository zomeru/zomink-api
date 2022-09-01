/* eslint-disable no-unused-vars */
import { DocumentType } from '@typegoose/typegoose';
import { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
// import { CreateUserInput } from '../schema/user.schema';
// import { NewUserDocument } from '../services/newUserService';

export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  version: number;
}

export interface AccessToken extends AccessTokenPayload {
  exp: number;
}

export interface RefreshToken extends RefreshTokenPayload {
  exp: number;
}

// eslint-disable-next-line no-shadow
export enum TokenExpiration {
  Access = 50 * 60,
  Refresh = 7 * 24 * 60 * 60,
  RefreshIfLessThan = 4 * 24 * 60 * 60,
}

// const accessTokenSecret = process.env.ACCESS_TOKEN_PUBLIC_KEY as string;
// const refreshTokenSecret = process.env.REFRESH_TOKEN_PUBLIC_KEY as string;

function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_PUBLIC_KEY as string, {
    expiresIn: TokenExpiration.Access,
  });
}

function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_PUBLIC_KEY as string, {
    expiresIn: TokenExpiration.Refresh,
  });
}

export function buildTokens(user: DocumentType<User>) {
  const accessPayload: AccessTokenPayload = { userId: user._id };
  const refreshPayload: RefreshTokenPayload = {
    userId: user._id,
    version: user.tokenVersion,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return {
    accessToken,
    refreshToken,
  };
}

/* eslint-disable  no-shadow */
export enum NewCookies {
  AccessToken = 'access',
  RefreshToken = 'refresh',
}
/* eslint-enable  no-shadow */

const defaultCookieOptions: CookieOptions = {
  httpOnly: process.env.NODE_ENV === 'production',
  secure: process.env.NODE_ENV === 'production',
  // sameSite: isProduction ? 'strict' : 'lax',
  sameSite: 'lax',
  // domain: isProduction ? 'zom.ink' : '127.0.0.1',
  domain: process.env.CLIENT_URL,
  path: '/',
};

const refreshTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Refresh * 1000,
};

const accessTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Access * 1000,
};

export function setTokens(res: Response, access: string, refresh?: string) {
  res.cookie(NewCookies.AccessToken, access, accessTokenCookieOptions);
  if (refresh)
    res.cookie(NewCookies.RefreshToken, refresh, refreshTokenCookieOptions);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_PUBLIC_KEY as string
  ) as RefreshToken;
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_PUBLIC_KEY as string
    ) as AccessToken;
  } catch (error) {
    return null;
  }
}

export function refreshTokens(current: RefreshToken, tokenVersion: number) {
  // eslint-disable-next-line no-throw-literal
  if (tokenVersion !== current.version) throw 'Token revoked';

  const accessPayload: AccessTokenPayload = { userId: current.userId };
  const accessToken = signAccessToken(accessPayload);

  let refreshPayload: RefreshTokenPayload | undefined;

  const expiration = new Date(current.exp * 1000);

  const now = new Date();
  const secondsUntilExpiration = (expiration.getTime() - now.getTime()) / 1000;
  if (secondsUntilExpiration < TokenExpiration.RefreshIfLessThan) {
    refreshPayload = {
      userId: current.userId,
      version: tokenVersion,
    };
  }

  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return {
    accessToken,
    refreshToken,
  };
}

export function clearTokens(res: Response) {
  res.cookie(NewCookies.AccessToken, '', {
    ...defaultCookieOptions,
    maxAge: 0,
  });

  res.cookie(NewCookies.RefreshToken, '', {
    ...defaultCookieOptions,
    maxAge: 0,
  });
}
