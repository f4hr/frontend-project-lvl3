// @ts-check

import _ from 'lodash';
import onChange from 'on-change';
import validate from './validator';
import watch from './watcher';

const addPostToWatched = (id, watchedState) => {
  const state = watchedState;
  const { watchedPosts } = onChange.target(state).uiState;

  if (!_.includes(watchedPosts, id)) state.uiState.watchedPosts = [...watchedPosts, id];
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

    state.form.fields.url = input.value.trim();
    // Validate form
    validate(state.form.fields, state)
      .then(() => {
        state.form.valid = true;
        state.form.errors = {};
        // Add RSS feed to watcher
        watch(state.form.fields.url, state);
      })
      .catch((error) => {
        state.form.valid = false;
        state.form.errors = { url: { message: error.message } };
      });
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
