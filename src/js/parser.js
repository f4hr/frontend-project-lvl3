// @ts-check

import { getText } from './utils';

const parser = new DOMParser();

export default (data, i18n) => {
  const doc = parser.parseFromString(data, 'application/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) throw new Error(getText('rssForm.errors.invalidRss', i18n));

  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;
  const items = Array.from(doc.querySelectorAll('channel > item'))
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

  return {
    title,
    description,
    items,
  };
};
