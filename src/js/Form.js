// @ts-check

import _ from 'lodash';
import { getFeedsUrl, validate } from './utils';

export default class Form {
  constructor(params) {
    const {
      container,
      watcher,
      i18n,
      state,
    } = params;

    this.DOM = { el: container };
    this.DOM.feedback = document.querySelector('.feedback');
    this.DOM.submitButton = this.DOM.el.querySelector('button[type="submit"]');
    this.fieldElements = {
      url: this.DOM.el.querySelector('#url-input'),
    };
    this.watchedState = state;
    this.proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';
    this.watcher = watcher;
    this.i18n = i18n;
    this.errorMessages = {
      network: {
        error: i18n.t('errors.networkError'),
      },
    };
  }

  init() {
    this.DOM.el.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate form
      Object.entries(this.fieldElements).forEach(([name, element]) => {
        this.watchedState.form.fields[name] = element.value;
        this.updateValidationState();
      });

      // Send request
      if (this.watchedState.form.valid) {
        const url = `${this.proxy}${encodeURIComponent(this.watchedState.form.fields.url)}`;
        this.watcher.getFeed(url);
        this.DOM.feedback.classList.remove('text-danger');
        this.DOM.feedback.classList.add('text-success');
        this.DOM.feedback.innerHTML = this.i18n.t('rssForm.success.rssDownloaded');
        this.resetInputs();
      }
    });
  }

  processStateHandler(processState) {
    switch (processState) {
      case 'failed':
        this.DOM.submitButton.disabled = false;
        break;
      case 'filling':
        this.DOM.submitButton.disabled = false;
        break;
      case 'sending':
        this.DOM.submitButton.disabled = true;
        break;
      case 'finished':
        this.DOM.submitButton.disabled = false;
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  }

  updateValidationState() {
    const errors = validate(this.watchedState.form.fields);

    if (_.includes(getFeedsUrl(this.watchedState.feeds), this.watchedState.form.fields.url)) {
      errors.url = { message: this.i18n.t('rssForm.errors.rssAlreadyExists') };
    }

    this.watchedState.form.valid = _.isEqual(errors, {});
    this.watchedState.form.errors = errors;
  }

  renderErrors(errors) {
    Object.entries(this.fieldElements).forEach(([name, element]) => {
      const errorElement = this.DOM.feedback;
      const error = errors[name];

      if (errorElement) {
        element.classList.remove('is-invalid');
        errorElement.innerHTML = '';
        errorElement.classList.remove('text-success');
        errorElement.classList.add('text-danger');
      }
      if (!error) {
        return;
      }

      const feedbackElement = document.createElement('span');

      feedbackElement.innerHTML = error.message;
      element.classList.add('is-invalid');
      errorElement.append(feedbackElement);
    });
  }

  resetInputs() {
    Object.values(this.fieldElements).forEach((value) => {
      const element = value;

      element.value = '';
    });
  }
}
