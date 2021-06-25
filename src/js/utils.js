// @ts-check

import { includes, find } from 'lodash';
import onChange from 'on-change';

const globals = {};

const setI18n = (i18n) => {
  globals.i18n = i18n;
};
const getFeedsUrl = (feeds) => feeds.map((feed) => feed.url);
const getText = (field) => globals.i18n.t(field);
const getPostData = (id, state) => {
  const { posts } = onChange.target(state);
  return find(posts, ['id', id]);
};
const addPostToWatched = (id, watchedState) => {
  const state = watchedState;
  const { watchedPosts } = onChange.target(state).uiState;

  if (includes(watchedPosts, id)) {
    return;
  }

  state.uiState.watchedPosts = [...watchedPosts, id];
};

export {
  setI18n,
  getFeedsUrl,
  getText,
  getPostData,
  addPostToWatched,
};
