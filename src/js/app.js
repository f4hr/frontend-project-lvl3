// @ts-check

import onChange from 'on-change';
import { initEvents, initPostEvents } from './events';
import {
  renderFeeds,
  renderPosts,
  renderModal,
  renderErrors,
  processStateHandler,
} from './render';

const defaultState = {
  watcher: {
    delay: 5000,
    isActive: false,
    proxy: 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=',
  },
  form: {
    processState: 'filling',
    fields: {
      url: '',
    },
    valid: true,
    errors: {},
  },
  feeds: [],
  posts: [],
  uiState: {
    watchedPosts: [],
    activePost: 0,
  },
};

const initElements = () => {
  const container = document.querySelector('body > main');
  const form = container.querySelector('form');
  const input = form.querySelector('input[name="url"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const feedback = container.querySelector('.feedback');
  const feedsContainer = container.querySelector('.feeds');
  const postsContainer = container.querySelector('.posts');
  const modal = document.querySelector('#modal');

  return {
    form,
    input,
    submitBtn,
    feedback,
    feedsContainer,
    postsContainer,
    modal,
  };
};

const initWatchedState = (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'feeds':
      renderFeeds(value, elements.feedsContainer);
      break;
    case 'posts':
      renderPosts(value, elements.postsContainer, state.uiState.watchedPosts);
      initPostEvents(elements.postsContainer, state);
      break;
    case 'form.processState':
      processStateHandler(value, elements);
      break;
    case 'form.errors':
      renderErrors(value, elements, state);
      break;
    case 'uiState.watchedPosts':
      renderPosts(value, elements.postsContainer, state.uiState.watchedPosts);
      break;
    case 'uiState.activePost':
      renderModal(value, elements.modal, state);
      break;
    default:
      break;
  }
});

const app = () => {
  // Init state
  const state = { ...defaultState };
  // Init DOM elements
  const elements = initElements();
  // Init state watcher
  const watchedState = initWatchedState(state, elements);
  // Init event handlers
  initEvents(elements, watchedState);
};

export default app;
