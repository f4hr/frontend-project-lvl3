// @ts-check

import i18n from 'i18next';

const PROXY = 'https://hexlet-allorigins.herokuapp.com/get';

const getProxiedUrl = (url) => {
  const proxy = new URL(PROXY);
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);

  return proxy.toString();
};

const getFeedsUrl = (feeds) => feeds.map((feed) => feed.url);

const getText = (field) => i18n.t(field);

export {
  getProxiedUrl,
  getFeedsUrl,
  getText,
};
