// @ts-check

const parser = new DOMParser();

export default (data, url) => {
  const doc = parser.parseFromString(data, 'application/xml');

  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;
  const items = Array.from(doc.querySelectorAll('channel > item'))
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      url: item.querySelector('link').textContent,
      guid: item.querySelector('guid').textContent,
      date: item.querySelector('pubDate').textContent,
    }));

  return {
    title,
    description,
    url,
    items,
  };
};
