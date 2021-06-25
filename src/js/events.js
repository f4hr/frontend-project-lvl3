// @ts-check

import { includes, isEqual } from 'lodash';
import { getFeedsUrl, addPostToWatched } from './utils';
import validate from './validator';
import watch from './watcher';

const updateValidationState = (watchedState) => {
  const state = watchedState;
  const errors = validate(state.form.fields);
  const proxiedUrl = `${state.watcher.proxy}${encodeURIComponent(state.form.fields.url)}`;

  if (includes(getFeedsUrl(state.feeds), proxiedUrl)) {
    errors.url = { message: 'rssForm.errors.rssAlreadyExists' };
  }

  state.form.valid = isEqual(errors, {});
  state.form.errors = errors;
};

const initEvents = (elements, watchedState) => {
  const state = watchedState;
  const {
    input,
    form,
    modal,
  } = elements;

  // Set URL input focus
  input.focus();
  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate form
    state.form.fields.url = input.value;
    updateValidationState(state);

    if (state.form.valid) {
      // Add RSS feed to watcher
      watch(state.form.fields.url, state);
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

const initPostsEvents = (container, watchedState) => {
  const state = watchedState;
  const posts = Array.from(container.querySelectorAll('li'));

  posts.forEach((post) => {
    const link = post.querySelector('a');
    const button = post.querySelector('button');
    const id = parseInt(button.dataset.id, 10);

    link.addEventListener('click', () => {
      addPostToWatched(id, state);
    });
  });
};

export { initEvents, initPostsEvents };
