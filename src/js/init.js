// @ts-check

import i18n from 'i18next';
import { setLocale } from 'yup';
// eslint-disable-next-line no-unused-vars
import { Modal } from 'bootstrap';
import resources from '../../locales';
import View from './View';

const state = {
  watcher: {
    delay: 5000,
    isActive: false,
  },
  form: {
    processState: 'filling',
    processError: null,
    fields: {
      url: '',
    },
    valid: true,
    errors: {},
  },
  feeds: [],
  items: [],
  uiState: {
    watchedPosts: [],
  },
};

const initTranslation = () => {
  // Validation setup
  setLocale({
    string: {
      url: i18n.t('rssForm.errors.urlNotValid'),
    },
  });
};

const init = () => {
  const container = document.getElementById('app');
  const view = new View({
    container,
    state,
    i18n,
  });
  // Locale setup
  i18n.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    initTranslation();
  });

  view.init();
};

export default init;
