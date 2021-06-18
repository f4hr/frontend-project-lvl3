// @ts-check

import _ from 'lodash';
import * as yup from 'yup';
import { setLocale } from 'yup';
import axios from 'axios';
import onChange from 'on-change';
import RssParser from './RssParser';
import { getFeedsUrl } from './utils';

export default class Form {
  constructor(el) {
    this.DOM = { el };
    this.DOM.feedback = document.querySelector('.feedback');
    this.DOM.submitButton = this.DOM.el.querySelector('button[type="submit"]');
    this.fieldElements = {
      url: this.DOM.el.querySelector('#url-input'),
    };
    this.proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';

    // Validation setup
    setLocale({
      string: {
        url: 'Ссылка должна быть валидным URL',
      },
    });
    this.schema = yup.object().shape({
      url: yup.string().required().url(),
    });
    this.errorMessages = {
      network: {
        error: 'Network Problems. Try again.',
      },
    };
  }

  init(state) {
    this.watchedState = state;
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
        this.getFeed(url);
      }
    });
  }

  getFeed(url) {
    this.watchedState.form.processState = 'sending';

    axios.get(url)
      .then((response) => {
        const feedUrl = response.data.status.url;
        const parser = new RssParser(new DOMParser());
        parser.parse(response.data.contents, feedUrl);

        this.watchedState.form.processState = 'finished';
        this.DOM.feedback.innerHTML = 'RSS успешно загружен';

        const feed = parser.getData();
        this.addFeed(feed);
      })
      .catch((error) => {
        this.watchedState.form.processState = 'failed';
        console.error(error);
      });
  }

  addFeed(data) {
    const feedsLength = onChange.target(this.watchedState).feeds.length;
    const itemsLength = onChange.target(this.watchedState).items.length;
    const {
      title,
      description,
      feedUrl,
      items,
    } = data;
    const feed = {
      id: feedsLength,
      title,
      description,
      url: feedUrl,
    };

    let count = itemsLength;
    const feedItems = items.map((item) => {
      const feedItem = { ...item };
      feedItem.id = count;
      feedItem.feedId = feed.id;

      count += 1;
      return feedItem;
    });

    this.watchedState.feeds = [feed, ...onChange.target(this.watchedState).feeds];
    this.watchedState.items = [...feedItems, ...onChange.target(this.watchedState).items];

    console.log(this.watchedState);
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
        this.DOM.feedback.classList.remove('text-danger');
        this.DOM.feedback.classList.add('text-success');
        this.resetInputs();
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  }

  updateValidationState() {
    const errors = this.validate(this.watchedState.form.fields);

    if (_.includes(getFeedsUrl(this.watchedState.feeds), this.watchedState.form.fields.url)) {
      errors.url = { message: 'RSS уже существует' };
    }

    this.watchedState.form.valid = _.isEqual(errors, {});
    this.watchedState.form.errors = errors;
  }

  validate(fields) {
    try {
      this.schema.validateSync(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return _.keyBy(e.inner, 'path');
    }
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
