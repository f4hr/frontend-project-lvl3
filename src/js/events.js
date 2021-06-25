// @ts-check

import _ from 'lodash';
import { getFeedsUrl, addPostToWatched } from './utils';
import validate from './validator';
import watch from './watcher';

const updateValidationState = (watchedState) => {
  const state = watchedState;
  const errors = validate(state.form.fields);
  const proxiedUrl = `${state.watcher.proxy}${encodeURIComponent(state.form.fields.url)}`;

  if (_.includes(getFeedsUrl(state.feeds), proxiedUrl)) {
    errors.url = { message: 'rssForm.errors.rssAlreadyExists' };
  }

  state.form.valid = _.isEqual(errors, {});
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
  // Reset modal on close
  modal.addEventListener('hidden.bs.modal', () => {
    modal.querySelector('.modal-title').textContent = '';
    modal.querySelector('.modal-body').textContent = '';
    modal.querySelector('.full-article').href = '#';
  });
};

const initPostEvents = (container, watchedState) => {
  const state = watchedState;
  const posts = Array.from(container.querySelectorAll('li'));

  posts.forEach((post) => {
    const link = post.querySelector('a');
    const button = post.querySelector('button');
    link.addEventListener('click', () => {
      addPostToWatched(post.id, state);
    });
    button.addEventListener('click', () => {
      addPostToWatched(post.id, state);
      state.uiState.activePost = post.id;
    });
  });
};

export { initEvents, initPostEvents };
