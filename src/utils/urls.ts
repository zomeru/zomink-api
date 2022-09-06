import { customAlphabet } from 'nanoid';

export const aliasGen = (length: number | undefined = 0): string => {
  const alphaNum =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return customAlphabet(alphaNum, length)();
};
