// @ts-check

import i18next from 'i18next';
// eslint-disable-next-line no-unused-vars
import { Modal } from 'bootstrap';
import * as yup from 'yup';
import { setLocale } from 'yup';
import resources from '../../locales';
import app from './app';
import { setI18n, getText } from './utils';
import { initValidator } from './validator';

const init = () => {
  // Locale setup
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    setI18n(i18nextInstance);
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
    app();
  });
};

export default init;
