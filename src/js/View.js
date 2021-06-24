// @ts-check

import onChange from 'on-change';
import Form from './Form';
import Watcher from './Watcher';
import { addPostToWatched } from './utils';

export default class View {
  constructor(params) {
    const {
      container,
      state,
    } = params;

    this.DOM = { el: container };
    this.DOM.form = this.DOM.el.querySelector('.rss-form');
    this.DOM.feeds = this.DOM.el.querySelector('.feeds');
    this.DOM.posts = this.DOM.el.querySelector('.posts');
    this.DOM.modal = document.querySelector('#modal');
    this.watchedState = onChange(state, (path, value) => {
      switch (path) {
        case 'feeds':
          this.renderFeeds(value);
          break;
        case 'items':
          this.renderItems(value);
          break;
        case 'form.processState':
          this.form.processStateHandler(value);
          break;
        case 'form.errors':
          this.form.renderErrors(value);
          break;
        case 'uiState.watchedPosts':
          this.renderItems(onChange.target(this.watchedState).items);
          break;
        default:
          break;
      }
    });
  }

  init(params) {
    const {
      i18n,
      validator,
    } = params;
    this.form = new Form({
      container: this.DOM.form,
      state: this.watchedState,
      i18n,
      watcher: new Watcher(this.watchedState),
      validator,
    });
    this.i18n = i18n;
    this.form.init();
    this.DOM.modal.addEventListener('hidden.bs.modal', () => {
      this.DOM.modal.querySelector('.modal-title').textContent = '';
      this.DOM.modal.querySelector('.modal-body').textContent = '';
      this.DOM.modal.querySelector('.full-article').href = '#';
    });
  }

  buildFeedsContainer() {
    this.DOM.feeds.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('card', 'border-0');
    const header = document.createElement('div');
    header.classList.add('card-body');
    container.append(header);
    const heading = document.createElement('h2');
    heading.classList.add('card-title', 'h4');
    heading.textContent = 'Фиды';
    header.append(heading);
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    container.append(list);
    this.DOM.feeds.append(container);
  }

  populateFeeds(feeds, listItem) {
    const list = this.DOM.feeds.querySelector('.list-group');

    feeds.forEach((feed) => {
      const item = listItem.cloneNode(true);
      item.querySelector('h3').textContent = feed.title;
      item.querySelector('p').textContent = feed.description;
      list.append(item);
    });
  }

  renderFeeds(feeds) {
    this.buildFeedsContainer();
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const listItemHeading = document.createElement('h3');
    listItemHeading.classList.add('h6', 'm-0');
    listItem.append(listItemHeading);
    const listItemDescription = document.createElement('p');
    listItemDescription.classList.add('m-0', 'small', 'text-black-50');
    listItem.append(listItemDescription);
    this.populateFeeds(feeds, listItem);

    this.form.DOM.feedback.classList.remove('text-danger');
    this.form.DOM.feedback.classList.add('text-success');
    this.form.DOM.feedback.innerHTML = this.i18n.t('rssForm.success.rssDownloaded');
    this.form.resetInputs();
  }

  buildItemsContainer() {
    this.DOM.posts.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('card', 'border-0');
    const header = document.createElement('div');
    header.classList.add('card-body');
    container.append(header);
    const heading = document.createElement('h2');
    heading.classList.add('card-title', 'h4');
    heading.textContent = 'Посты';
    header.append(heading);
    // Feed list
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    container.append(list);
    this.DOM.posts.append(container);
  }

  populateItems(posts, listItem) {
    const { watchedPosts } = onChange.target(this.watchedState).uiState;
    const list = this.DOM.items.querySelector('.list-group');
    posts.forEach((post) => {
      const item = listItem.cloneNode(true);
      const link = item.querySelector('a');
      const button = item.querySelector('button');
      const linkClass = (watchedPosts.includes(post.id))
        ? ['fw-normal', 'link-secondary']
        : ['fw-bold'];

      link.classList.add(...linkClass);
      link.textContent = post.title;
      link.href = post.url;
      link.addEventListener('click', () => {
        addPostToWatched(post.id, this.watchedState);
      });
      button.dataset.id = post.id;
      button.addEventListener('click', () => {
        this.DOM.modal.querySelector('.modal-title').textContent = post.title;
        this.DOM.modal.querySelector('.modal-body').textContent = post.description;
        this.DOM.modal.querySelector('.full-article').href = post.url;
        addPostToWatched(post.id, this.watchedState);
      });

      list.append(item);
    });
  }

  renderItems(posts) {
    this.buildItemsContainer();
    // Feed item
    const listItem = document.createElement('li');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    // Link
    const listItemLink = document.createElement('a');
    // listItemLink.classList.add('fw-bold');
    listItemLink.setAttribute('target', '_blank');
    listItemLink.setAttribute('rel', 'noopener noreferrer');
    listItem.append(listItemLink);
    // Button
    const listItemBtn = document.createElement('button');
    listItemBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    listItemBtn.setAttribute('type', 'button');
    listItemBtn.dataset.bsToggle = 'modal';
    listItemBtn.dataset.bsTarget = '#modal';
    listItemBtn.textContent = this.i18n.t('feed.viewBtn');
    listItem.append(listItemBtn);
    this.populateItems(posts, listItem);
  }
}
