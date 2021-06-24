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
    setTimeout(() => {
      const { feeds } = onChange.target(this.watchedState);
      const result = Promise.all(feeds.map(({ url }) => axios.get(url)));

      result
        .then((responses) => {
          responses.forEach((response) => {
            const feed = this.parseFeed(response.data.contents, response.config.url);

            if (!_.isEqual(feed, {})) {
              this.watchedState.form.processState = 'finished';
              this.addFeed(feed);
            }
          });

          this.updateFeeds();
        })
        .catch(() => {
          this.watchedState.form.errors = {
            ...onChange.target(this.watchedState).form.errors,
            url: { message: 'errors.networkError' },
          };
          this.watchedState.form.processState = 'failed';
          console.log();
        });
    }, this.watchedState.watcher.delay);
  }

  getFeed(url) {
    this.watchedState.form.processState = 'sending';
    const proxiedUrl = `${this.watchedState.watcher.proxy}${encodeURIComponent(url)}`;

    axios.get(proxiedUrl)
      .then((response) => {
        const feed = this.parseFeed(response.data.contents, proxiedUrl);

        if (!_.isEqual(feed, {})) {
          this.watchedState.form.processState = 'finished';
          this.addFeed(feed);
        }
      })
      .catch(() => {
        this.watchedState.form.errors = {
          ...onChange.target(this.watchedState).form.errors,
          url: { message: 'errors.networkError' },
        };
        this.watchedState.form.processState = 'failed';
      });
  }

  addFeed(data) {
    const {
      title,
      description,
      url,
      items,
    } = data;
    const feed = {
      title,
      description,
      url,
    };

    if (!_.includes(getFeedsUrl(this.watchedState.feeds), feed.url)) {
      this.watchedState.feeds = [feed, ...onChange.target(this.watchedState).feeds];
    }

    this.addItems(items);

    if (!this.watchedState.watcher.isActive) {
      this.start();
    }
  }

  addItems(items) {
    const itemsLength = onChange.target(this.watchedState).items.length;

    let count = itemsLength;
    const itemsGuid = onChange.target(this.watchedState).items.map((item) => item.guid);
    const feedItems = items
      .filter(({ guid }) => !_.includes(itemsGuid, guid))
      .map((item) => {
        const feedItem = { ...item };
        feedItem.id = count;

        count += 1;
        return feedItem;
      });

    this.watchedState.items = [...feedItems, ...onChange.target(this.watchedState).items];
  }
}
