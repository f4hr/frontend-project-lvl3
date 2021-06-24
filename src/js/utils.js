// @ts-check

import _ from 'lodash';
import onChange from 'on-change';

const getFeedsUrl = (feeds) => feeds.map((feed) => feed.url);
const addPostToWatched = (id, state) => {
  const { watchedPosts } = onChange.target(state).uiState;

  if (_.includes(watchedPosts, id)) {
    return;
  }

  state.uiState.watchedPosts.push(id);
};

export { getFeedsUrl, addPostToWatched };
export default getFeedsUrl;
