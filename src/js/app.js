// @ts-check

import 'bootstrap';
import _ from 'lodash';
import i18next from 'i18next';
import onChange from 'on-change';
import { setLocale } from 'yup';
import resources from '../../locales';
import { initEvents, initPostsEvents } from './events';
import {
  renderFeeds,
  renderPosts,
  renderModal,
  renderErrors,
  processStateHandler,
} from './render';

const DEFAULT_LANG = 'ru';

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

const initWatchedState = (state, elements, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'feeds':
      renderFeeds(value, elements.feedsContainer);
      break;
    case 'posts':
      renderPosts(value, elements.postsContainer, state.uiState.watchedPosts, i18n);
      initPostsEvents(elements.postsContainer, state);
      break;
    case 'form.processState':
      processStateHandler(value, elements, i18n);
      break;
    case 'form.errors':
      renderErrors(value, elements, state, i18n);
      break;
    case 'uiState.watchedPosts':
      renderPosts(state.posts, elements.postsContainer, state.uiState.watchedPosts, i18n);
      break;
    case 'uiState.modal.postId':
      renderModal(value, elements.modal, state, i18n);
      break;
    default:
      break;
  }
});

export default () => {
  // Locale setup
  setLocale({
    mixed: {
      required: 'errors.fieldRequired',
      notOneOf: 'rssForm.errors.rssAlreadyExists',
    },
    string: {
      url: 'errors.invalidUrl',
    },
  });

  const i18nextInstance = i18next.createInstance();

  return i18nextInstance.init({
    lng: DEFAULT_LANG,
    debug: false,
    resources,
  }).then(() => {
    // Init state
    const state = _.cloneDeep(defaultState);
    // Init DOM elements
    const elements = initElements();
    // Init state watcher
    const watchedState = initWatchedState(state, elements, i18nextInstance);
    // Init event handlers
    initEvents(elements, watchedState);
  });
};
