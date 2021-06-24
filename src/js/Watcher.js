// @ts-check

import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import RssParser from './RssParser';
import { getFeedsUrl } from './utils';

export default class Watcher {
  constructor(state) {
    this.watchedState = state;
    this.parser = new RssParser(new DOMParser());
  }

  start() {
    this.watchedState.watcher.isActive = true;
    this.updateFeeds();
  }

  parseFeed(data, url) {
    let feed = {};
    // Try parsing response data
    try {
      feed = this.parser.parse(data, url);
    } catch (error) {
      this.watchedState.form.errors = {
        ...onChange.target(this.watchedState).form.errors,
        url: { message: 'rssForm.errors.invalidRss' },
      };
      this.watchedState.form.processState = 'failed';
    }

    return feed;
  }

  updateFeeds() {
    const { feeds } = onChange.target(this.watchedState);
    const getFeeds = () => {
      const result = Promise.all(feeds.map(({ url }) => axios.get(url)));

      result
        .then((responses) => {
          responses.forEach((response) => {
            const feed = this.parseFeed(response.data.contents, response.config.url);

            this.watchedState.form.processState = 'finished';
            this.addFeed(feed);
          });

          this.updateFeeds();
        })
        .catch((error) => {
          this.watchedState.form.errors = {
            ...onChange.target(this.watchedState).form.errors,
            url: { message: 'errors.networkError' },
          };
          this.watchedState.form.processState = 'failed';
          console.error(error);
        });
    };

    setTimeout(getFeeds, this.watchedState.watcher.delay);
  }

  getFeed(url) {
    this.watchedState.form.processState = 'sending';

    axios.get(url)
      .then((response) => {
        const feed = this.parseFeed(response.data.contents, response.config.url);

        this.watchedState.form.processState = 'finished';
        this.addFeed(feed);
      })
      .catch((error) => {
        this.watchedState.form.errors = {
          ...onChange.target(this.watchedState).form.errors,
          url: { message: 'errors.networkError' },
        };
        this.watchedState.form.processState = 'failed';
        console.error(error);
      });
  }

  addFeed(data) {
    if (_.isEqual(data, {})) {
      this.watchedState.form.errors = {
        ...onChange.target(this.watchedState).form.errors,
        url: { message: 'rssForm.errors.invalidRss' },
      };
      this.watchedState.form.processState = 'failed';

      return;
    }

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
