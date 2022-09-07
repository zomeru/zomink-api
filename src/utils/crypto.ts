import crypto from 'crypto';

const OUTPUT_FORMAT = 'hex';
const ALGORITHM = 'aes256';

export function encrypt(message: string) {
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(process.env.CRYPTO_SECRET_KEY!),
    Buffer.from(process.env.CRYPTO_IV_KEY!)
  );
  return Buffer.concat([cipher.update(message), cipher.final()]).toString(
    OUTPUT_FORMAT
  );
}

export function decrypt(message: string) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(process.env.CRYPTO_SECRET_KEY!),
    Buffer.from(process.env.CRYPTO_IV_KEY!)
  );
  return Buffer.concat([
    decipher.update(Buffer.from(message, OUTPUT_FORMAT)),
    decipher.final(),
  ]).toString('utf8');
}
