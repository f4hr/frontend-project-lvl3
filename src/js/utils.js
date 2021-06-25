// @ts-check

import _ from 'lodash';
import onChange from 'on-change';

const globals = {};

const setI18n = (i18n) => {
  globals.i18n = i18n;
};
const getFeedsUrl = (feeds) => feeds.map((feed) => feed.url);
const getText = (field) => globals.i18n.t(field);
const getPostData = (id, state) => _.find(state.posts, ['id', id]);
const addPostToWatched = (id, state) => {
  const { watchedPosts } = onChange.target(state).uiState;

  if (_.includes(watchedPosts, id)) {
    return;
  }

  state.uiState.watchedPosts.push(id);
};

export {
  setI18n,
  getFeedsUrl,
  getText,
  getPostData,
  addPostToWatched,
};
