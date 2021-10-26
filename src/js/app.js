// @ts-check

import 'bootstrap';
import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import { setLocale } from 'yup';
import { getText } from './utils';
import resources from '../../locales';
import { initValidator } from './validator';
import { initEvents, initPostsEvents } from './events';
import {
  renderFeeds,
  renderPosts,
  renderModal,
  renderErrors,
  processStateHandler,
} from './render';

const defaultState = {
  watcher: {
    state: 'idle',
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
    modal: {
      postId: null,
      visible: false,
    },
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
      initPostsEvents(elements.postsContainer, state);
      break;
    case 'form.processState':
      processStateHandler(value, elements);
      break;
    case 'form.errors':
      renderErrors(value, elements, state);
      break;
    case 'uiState.watchedPosts':
      renderPosts(state.posts, elements.postsContainer, state.uiState.watchedPosts);
      break;
    case 'uiState.modal.postId':
      renderModal(value, elements.modal, state);
      break;
    default:
      break;
  }
});

const app = () => {
  // Locale setup
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    // Validation setup
    setLocale({
      mixed: {
        required: getText('errors.fieldRequired'),
      },
      string: {
        url: getText('errors.urlNotValid'),
        required: getText('errors.fieldRequired'),
      },
    });
    const schema = yup.object().shape({
      url: yup.string().required().url(),
    });
    initValidator(schema);
    // Init state
    const state = { ...defaultState };
    // Init DOM elements
    const elements = initElements();
    // Init state watcher
    const watchedState = initWatchedState(state, elements);
    // Init event handlers
    initEvents(elements, watchedState);
  });
};

export default app;
