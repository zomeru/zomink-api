import jwt from 'jsonwebtoken';

export function signJwt(
  object: Object,
  keyName: 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY',
  options?: jwt.SignOptions | undefined
) {
  const signingKey = Buffer.from(
    process.env[keyName] as string,
    'base64'
  ).toString('ascii');

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: 'RS256',
  });
}

export type VerifyJwtResult = {
  decoded: { session: string } | null;
  expired: boolean;
  valid: boolean;
};

export function verifyJwt(
  token: string,
  keyName: 'ACCESS_TOKEN_PUBLIC_KEY' | 'REFRESH_TOKEN_PUBLIC_KEY'
): VerifyJwtResult | null {
  const publicKey = Buffer.from(
    process.env[keyName] as string,
    'base64'
  ).toString('ascii');

  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded: decoded as { session: string },
    };
  } catch (error: any) {
    // return null;
    return {
      valid: false,
      expired: error.message === 'jwt expired',
      decoded: null,
    };
  }
}
