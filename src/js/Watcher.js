import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import RssParser from './RssParser';
import { getFeedsUrl } from './utils';

export default class Watcher {
  constructor(state) {
    this.watchedState = state;
  }

  start() {
    this.watchedState.watcher.isActive = true;
    this.updateFeeds();
  }

  updateFeeds() {
    const { feeds } = onChange.target(this.watchedState);
    const getFeeds = () => {
      const result = Promise.all(feeds.map(({ url }) => axios.get(url)));

      result
        .then((responses) => {
          responses.forEach((response) => {
            const feedUrl = response.config.url;
            const parser = new RssParser(new DOMParser());
            parser.parse(response.data.contents, feedUrl);

            const feed = parser.getData();
            this.addFeed(feed);
          });

          this.updateFeeds();
        })
        .catch((error) => {
          console.error(error);
        });
    };

    setTimeout(getFeeds, this.watchedState.watcher.delay);
  }

  getFeed(url) {
    this.watchedState.form.processState = 'sending';

    axios.get(url)
      .then((response) => {
        const feedUrl = response.config.url;
        const parser = new RssParser(new DOMParser());
        parser.parse(response.data.contents, feedUrl);

        this.watchedState.form.processState = 'finished';

        const feed = parser.getData();
        this.addFeed(feed);
      })
      .catch((error) => {
        this.watchedState.form.processState = 'failed';
        console.error(error);
      });
  }

  addFeed(data) {
    const feedsLength = onChange.target(this.watchedState).feeds.length;
    const itemsLength = onChange.target(this.watchedState).items.length;
    const {
      title,
      description,
      url,
      items,
    } = data;
    const feed = {
      id: feedsLength,
      title,
      description,
      url,
    };

    let count = itemsLength;
    const itemsGuid = onChange.target(this.watchedState).items.map((item) => item.guid);
    const feedItems = items
      .filter(({ guid }) => !_.includes(itemsGuid, guid))
      .map((item) => {
        const feedItem = { ...item };
        feedItem.id = count;
        feedItem.feedId = feed.id;

        count += 1;
        return feedItem;
      });

    if (!_.includes(getFeedsUrl(this.watchedState.feeds), feed.url)) {
      this.watchedState.feeds = [feed, ...onChange.target(this.watchedState).feeds];
    }

    this.watchedState.items = [...feedItems, ...onChange.target(this.watchedState).items];

    if (!this.watchedState.watcher.isActive) {
      this.start();
    }
  }
}
