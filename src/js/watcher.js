// @ts-check

import axios from 'axios';
import { includes, isEqual } from 'lodash';
import onChange from 'on-change';
import parser from './parser';
import { getFeedsUrl } from './utils';

const errorHandler = (error, watchedState) => {
  const state = watchedState;

  state.form.errors = { ...onChange.target(state).form.errors, url: { message: error } };
  state.form.processState = 'failed';
};

const parseFeed = (data, url, watchedState) => {
  const state = watchedState;

  // Try parsing response data
  try {
    return parser(new DOMParser(), data, url);
  } catch (error) {
    errorHandler('rssForm.errors.invalidRss', state);
  }

  return {};
};

const addItems = (items, watchedState) => {
  const state = watchedState;
  const itemsLength = onChange.target(state).posts.length;

  const itemsGuid = onChange.target(state).posts.map((item) => item.guid);
  const feedItems = items
    .filter(({ guid }) => !includes(itemsGuid, guid))
    .map((item, index) => {
      const feedItem = { ...item };
      feedItem.id = index + itemsLength;

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

  if (!includes(getFeedsUrl(state.feeds), feed.url)) {
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

          if (!isEqual(feed, {})) {
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

      if (!isEqual(feed, {})) {
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
