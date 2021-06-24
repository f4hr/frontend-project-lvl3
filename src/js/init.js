// @ts-check

import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
// eslint-disable-next-line no-unused-vars
import { Modal } from 'bootstrap';
import resources from '../../locales';
import View from './View';
import Validator from './Validator';

const initTranslation = (i18n) => {
  // Validation setup
  setLocale({
    mixed: {
      required: i18n.t('errors.fieldRequired'),
    },
    string: {
      url: i18n.t('errors.urlNotValid'),
      required: i18n.t('errors.fieldRequired'),
    },
  });
};

const init = () => {
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
  const container = document.getElementById('app');
  const view = new View({ container, state });
  // Locale setup
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    initTranslation(i18nextInstance);
    const schema = yup.object().shape({
      url: yup.string().required().url(),
    });
    const validator = new Validator(yup);
    validator.setSchema(schema);

    // Init view
    view.init({ i18n: i18nextInstance, validator });
  });
};

export default init;
