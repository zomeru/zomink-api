import { customAlphabet } from 'nanoid';

export const aliasGen = (length?: number) => {
  const alphaNum =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return customAlphabet(alphaNum, length || 5)();
};
