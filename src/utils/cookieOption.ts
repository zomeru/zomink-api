import { CookieOptions } from 'express';

function cookieOptions(maxAge: number, opt?: CookieOptions): CookieOptions {
  return {
    maxAge,
    httpOnly: true,
    domain: (process.env.CLIENT_ORIGIN as string) || 'localhost',
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    ...(opt && opt),
  };
}

export default cookieOptions;
