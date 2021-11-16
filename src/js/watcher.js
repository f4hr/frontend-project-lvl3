// @ts-check

import axios from 'axios';
import _ from 'lodash';
import parse from './parser';
import { getProxiedUrl, getFeedsUrl } from './utils';

const UPDATE_DELAY = 5000;

const errorHandler = (error, watchedState) => {
  const state = watchedState;

  state.form.errors = { ...state.form.errors, url: { message: error } };
  state.form.processState = 'failed';
};

const addItems = (items, watchedState) => {
  const state = watchedState;
  const itemsLength = state.posts.length;

  const itemsGuid = state.posts.map((item) => item.guid);
  const feedItems = items
    .filter(({ guid }) => !_.includes(itemsGuid, guid))
    .map((item, index) => {
      const feedItem = { ...item };
      feedItem.id = index + itemsLength;

      return feedItem;
    });

  state.posts = [...feedItems, ...state.posts];
};

const addFeed = (data, url, watchedState) => {
  const state = watchedState;
  const {
    title,
    description,
    items,
  } = data;
  const feed = {
    title,
    description,
    url,
  };

  if (!_.includes(getFeedsUrl(state), feed.url)) {
    state.feeds.unshift(feed);
  }

  addItems(items, state);
};

const getFeed = (url) => axios.get(getProxiedUrl(url))
  .then((response) => ({ url, response }));

const startWatcher = (state) => {
  setTimeout(() => {
    const { feeds } = state;

    Promise.all(feeds.map(({ url }) => getFeed(url)))
      .then((responses) => {
        responses.forEach(({ url, response }) => {
          const feed = parse(response.data.contents);

          addFeed(feed, url, state);
        });
      })
      .catch((error) => {
        errorHandler(error.message, state);
      })
      .finally(() => {
        startWatcher(state);
      });
  }, UPDATE_DELAY);
};

const watchFeed = (url, watchedState) => {
  const state = watchedState;

  state.form.processState = 'sending';

  getFeed(url)
    .then(({ response }) => {
      const feed = parse(response.data.contents);

      state.form.processState = 'finished';

      addFeed(feed, url, state);

      if (state.watcher.state === 'idle') {
        state.watcher.state = 'active';
        startWatcher(state);
      }
    })
    .catch((e) => {
      if (e.isAxiosError) {
        errorHandler('errors.networkError', state);

        setTimeout(() => {
          watchFeed(url, watchedState);
        }, UPDATE_DELAY);
      } else {
        errorHandler(e.message, state);
      }
    });
};

export default watchFeed;
