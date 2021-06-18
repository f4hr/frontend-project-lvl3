// @ts-check

export default class RssParser {
  constructor(parser) {
    this.parser = parser;
  }

  parse(data, url) {
    this.document = this.parser.parseFromString(data, 'application/xml');
    this.feedUrl = url;
  }

  getData() {
    return {
      title: this.getTitle(),
      description: this.getDescription(),
      feedUrl: this.getFeedUrl(),
      items: this.getItems(),
    };
  }

  getTitle() {
    return this.document.querySelector('channel > title').textContent;
  }

  getDescription() {
    return this.document.querySelector('channel > description').textContent;
  }

  getFeedUrl() {
    return this.feedUrl;
  }

  getItems() {
    const items = Array.from(this.document.querySelectorAll('channel > item'));

    return items.map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      url: item.querySelector('link').textContent,
      guid: item.querySelector('guid').textContent,
      date: item.querySelector('pubDate').textContent,
    }));
  }
}
