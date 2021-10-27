// @ts-check

import axios from 'axios';
import _ from 'lodash';
import onChange from 'on-change';
import parse from './parser';
import { getProxiedUrl, getFeedsUrl } from './utils';

const UPDATE_DELAY = 5000;

const errorHandler = (error, watchedState) => {
  const state = watchedState;

  state.form.errors = { ...onChange.target(state).form.errors, url: { message: error } };
  state.form.processState = 'failed';
};

const parseFeed = (data, url, watchedState) => {
  const state = watchedState;

  try {
    return parse(data, url);
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
    .filter(({ guid }) => !_.includes(itemsGuid, guid))
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

  if (!_.includes(getFeedsUrl(state.feeds), feed.url)) {
    state.feeds = [feed, ...onChange.target(state).feeds];
  }

  addItems(items, state);
};

const startWatcher = (watchedState) => {
  const state = watchedState;

  setTimeout(() => {
    const { feeds } = onChange.target(state);
    const result = Promise.all(feeds.map(({ url }) => axios.get(url)));

    result
      .then((responses) => {
        responses.forEach((response) => {
          const feed = parseFeed(response.data.contents, response.config.url, state);

          if (!_.isEqual(feed, {})) addFeed(feed, state);
        });

        startWatcher(state);
      })
      .catch(() => {
        errorHandler('errors.networkError', state);
      });
  }, UPDATE_DELAY);
};

const watchFeed = (url, watchedState) => {
  const state = watchedState;

  state.form.processState = 'sending';
  axios.get(url)
    .then((response) => {
      const feed = parseFeed(response.data.contents, url, state);

      if (!_.isEqual(feed, {})) {
        state.form.processState = 'finished';
        addFeed(feed, state);

        if (state.watcher.state === 'idle') {
          state.watcher.state = 'active';
          startWatcher(state);
        }
      }
    })
    .catch(() => {
      errorHandler('errors.networkError', state);
    });
};

export default (url, watchedState) => {
  const state = watchedState;
  const proxiedUrl = getProxiedUrl(url);

  watchFeed(proxiedUrl, state);
};
