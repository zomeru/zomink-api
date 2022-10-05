import fetch from 'node-fetch';

import { invalidLinks } from './invalidLink';

const myDomain = 'zom.ink';

// phishing domains
const phishingDomains = async () => {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt',
      {
        method: 'GET',
      }
    );

    const text = await response.text();
    return text;
  } catch (error) {
    return '';
  }
};

// phishing links
const phishingLinks = async () => {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-links-ACTIVE.txt',
      {
        method: 'GET',
      }
    );

    const text = await response.text();
    return text;
  } catch (error) {
    return '';
  }
};

/* eslint-disable */

export const linkAccepted = async (link: string) => {
  const match = link.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)/i);
  const hostname = match && match[1];

  const phishDomains = await phishingDomains();
  const phishLinks = await phishingLinks();

  // !phishLinks
  //         .split('\n')
  //         .some((item) => item.toLowerCase() === link.toLowerCase()

  return (
    (phishDomains
      ? !phishDomains
          .toLowerCase()
          .includes(hostname?.replace('www.', '').toLowerCase() || myDomain)
      : true) &&
    (phishLinks
      ? !phishLinks.toLowerCase().includes(link.toLowerCase())
      : true) &&
    !invalidLinks.includes(hostname?.replace('www.', '') || myDomain)
  );
};

export const linkValid = (link: string): boolean => {
  const match = link.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)/i);
  const hostname = match && match[1];

  const valid =
    !!link.match(
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
    ) &&
    !link.includes(' ') &&
    !hostname!.includes(myDomain);

  return valid;
};

export const aliasValid = (alias: string): boolean => {
  return (
    !!alias.match(/^[a-zA-Z0-9]+$/) && alias.length >= 5 && !alias.includes(' ')
  );
};
