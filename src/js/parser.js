// @ts-check

const state = {};

const getTitle = () => state.document.querySelector('channel > title').textContent;

const getDescription = () => state.document.querySelector('channel > description').textContent;

const getFeedUrl = () => state.feedUrl;

const getItems = () => {
  const items = Array.from(state.document.querySelectorAll('channel > item'));

  return items.map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    url: item.querySelector('link').textContent,
    guid: item.querySelector('guid').textContent,
    date: item.querySelector('pubDate').textContent,
  }));
};

export default (parser, data, url) => {
  state.document = parser.parseFromString(data, 'application/xml');
  state.feedUrl = url;

  return {
    title: getTitle(),
    description: getDescription(),
    url: getFeedUrl(),
    items: getItems(),
  };
};
