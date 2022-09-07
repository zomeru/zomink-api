import { customAlphabet } from 'nanoid';

export const aliasGen = (length: number | undefined = 5): string => {
  const alphaNum =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return customAlphabet(alphaNum, length)();
};

export const removeForwardSlash = (link: string) => {
  let newLink = `${link}`;
  while (newLink.charAt(newLink.length - 1) === '/') {
    newLink = newLink.substr(0, newLink.length - 1);
  }

  return newLink;
};
