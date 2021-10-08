// @ts-check

import _ from 'lodash';
import i18n from 'i18next';
import onChange from 'on-change';

const getFeedsUrl = (feeds) => feeds.map((feed) => feed.url);
const getText = (field) => i18n.t(field);
const getPostData = (id, state) => {
  const { posts } = onChange.target(state);
  return _.find(posts, ['id', id]);
};
const addPostToWatched = (id, watchedState) => {
  const state = watchedState;
  const { watchedPosts } = onChange.target(state).uiState;

  if (_.includes(watchedPosts, id)) {
    return;
  }

  state.uiState.watchedPosts = [...watchedPosts, id];
};

export {
  getFeedsUrl,
  getText,
  getPostData,
  addPostToWatched,
};
