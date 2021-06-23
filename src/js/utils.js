// @ts-check

import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const getFeedsUrl = (feeds) => feeds.map((feed) => feed.url);
const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};
const addPostToWatched = (id, state) => {
  const { watchedPosts } = onChange.target(state).uiState;

  if (_.includes(watchedPosts, id)) {
    return;
  }

  state.uiState.watchedPosts.push(id);
};

export { getFeedsUrl, validate, addPostToWatched };
export default getFeedsUrl;
