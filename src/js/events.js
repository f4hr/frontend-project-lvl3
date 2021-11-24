// @ts-check

import validate from './validator';
import { getFeedsUrl } from './utils';
import watch from './watcher';

const addPostToWatched = (id, state) => {
  state.uiState.watchedPosts.add(id);
};

export default (elements, watchedState, i18n) => {
  const state = watchedState;
  const {
    input,
    form,
    postsContainer,
    modal,
  } = elements;

  // Set URL input focus
  input.focus();
  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    state.form.fields.url = input.value.trim();
    // Validate form
    validate(state.form.fields, getFeedsUrl(state))
      .then(() => {
        state.form.valid = true;
        state.form.errors = {};
        // Add RSS feed to watcher
        watch(state.form.fields.url, state, i18n);
      })
      .catch((err) => {
        state.form.valid = false;
        state.form.errors = { url: { message: err.message } };
      });
  });
  // Post events
  postsContainer.addEventListener('click', (e) => {
    if (e.target.hasAttribute('href')) {
      const id = parseInt(e.target.dataset.id, 10);

      addPostToWatched(id, state);
    }
  });
  // Modal events
  modal.addEventListener('show.bs.modal', (e) => {
    const id = parseInt(e.relatedTarget.dataset.id, 10);

    addPostToWatched(id, state);
    state.uiState.modal.postId = id;
    state.uiState.modal.visible = true;
  });
  modal.addEventListener('hide.bs.modal', () => {
    state.uiState.modal.visible = false;
  });
};
