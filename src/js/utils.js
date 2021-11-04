// @ts-check

const PROXY = 'https://hexlet-allorigins.herokuapp.com/get';

const getProxiedUrl = (url) => {
  const proxy = new URL(PROXY);
  proxy.searchParams.set('disableCache', 'true');
  proxy.searchParams.set('url', url);

  return proxy.toString();
};

const getFeedsUrl = (state) => state.feeds.map((feed) => feed.url);

const getText = (field, i18n) => i18n.t(field);

export {
  getProxiedUrl,
  getFeedsUrl,
  getText,
};
