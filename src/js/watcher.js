// @ts-check

import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import parser from './rssParser';
import { getFeedsUrl } from './utils';

const errorHandler = (error, watchedState) => {
  const state = watchedState;

  state.form.errors = { ...onChange.target(state).form.errors, url: { message: error } };
  state.form.processState = 'failed';
};

const parseFeed = (data, url, watchedState) => {
  const state = watchedState;

  let feed = {};
  // Try parsing response data
  try {
    feed = parser(new DOMParser(), data, url);
  } catch (error) {
    errorHandler('rssForm.errors.invalidRss', state);
  }

  return feed;
};

const addItems = (items, watchedState) => {
  const state = watchedState;
  const itemsLength = onChange.target(state).posts.length;

  let count = itemsLength;
  const itemsGuid = onChange.target(state).posts.map((item) => item.guid);
  const feedItems = items
    .filter(({ guid }) => !_.includes(itemsGuid, guid))
    .map((item) => {
      const feedItem = { ...item };
      feedItem.id = count;

      count += 1;
      return feedItem;
    });

  state.posts = [...feedItems, ...onChange.target(state).posts];
};

const addFeed = (data, watchedState) => {
  const state = watchedState;
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

  if (!_.includes(getFeedsUrl(state.feeds), feed.url)) {
    state.feeds = [feed, ...onChange.target(state).feeds];
  }

  addItems(items, state);
};

const watchFeeds = (watchedState) => {
  const state = watchedState;
  const { delay } = state.watcher;

  setTimeout(() => {
    const { feeds } = onChange.target(state);
    const result = Promise.all(feeds.map(({ url }) => axios.get(url)));

    result
      .then((responses) => {
        responses.forEach((response) => {
          const feed = parseFeed(response.data.contents, response.config.url, state);

          if (!_.isEqual(feed, {})) {
            addFeed(feed, state);
          }
        });

        watchFeeds(state);
      })
      .catch((e) => {
        errorHandler('errors.networkError', state);
        console.log(e);
      });
  }, delay);
};

const getFeed = (url, watchedState) => {
  const state = watchedState;

  state.form.processState = 'sending';
  axios.get(url)
    .then((response) => {
      const feed = parseFeed(response.data.contents, url, state);

      if (!_.isEqual(feed, {})) {
        state.form.processState = 'finished';
        addFeed(feed, state);

        if (!state.watcher.isActive) {
          state.watcher.isActive = true;
          watchFeeds(state);
        }
      }
    })
    .catch((e) => {
      errorHandler('errors.networkError', state);
      console.log(e);
    });
};

export default (url, watchedState) => {
  const state = watchedState;
  const proxiedUrl = `${state.watcher.proxy}${encodeURIComponent(url)}`;

  getFeed(proxiedUrl, state);
};
