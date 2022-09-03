import { customAlphabet } from 'nanoid';

export const aliasGen = () => {
  const alphaNum =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return customAlphabet(alphaNum, 5)();
};
