import crypto from 'crypto';

// const OUTPUT_FORMAT = 'hex';
// const ALGORITHM = 'aes256';

// export function encrypt(message: string) {
//   const cipher = crypto.createCipheriv(
//     ALGORITHM,
//     process.env.CRYPTO_SECRET_KEY!,
//     process.env.CRYPTO_IV_KEY!
//   );
//   return Buffer.concat([cipher.update(message), cipher.final()]).toString(
//     OUTPUT_FORMAT
//   );
// }

// export function decrypt(message: string) {
//   const decipher = crypto.createDecipheriv(
//     ALGORITHM,
//     process.env.CRYPTO_SECRET_KEY!,
//     process.env.CRYPTO_IV_KEY!
//   );
//   return Buffer.concat([
//     decipher.update(Buffer.from(message, OUTPUT_FORMAT)),
//     decipher.final(),
//   ]).toString('utf8');
// }

// Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.CRYPTO_SECRET_KEY!),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string) {
  const textParts = text.split(':');
  // @ts-ignore
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.CRYPTO_SECRET_KEY!),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
