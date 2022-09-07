export const stringToBase64 = (str: string): string =>
  Buffer.from(str, 'ascii').toString('base64');

export const base64ToString = (str: string): string =>
  Buffer.from(str, 'base64').toString('ascii');
