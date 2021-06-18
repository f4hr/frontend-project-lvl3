// @ts-check

import onChange from 'on-change';
import Form from './Form';

export default class View {
  constructor(el) {
    this.DOM = { el };
    this.DOM.form = this.DOM.el.querySelector('.rss-form');
    this.DOM.feeds = this.DOM.el.querySelector('.feeds');
    this.DOM.posts = this.DOM.el.querySelector('.posts');
    this.form = new Form(this.DOM.form);
  }

  init(state) {
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
        default:
          break;
      }
    });
    this.form.init(this.watchedState);
  }

  renderFeeds(feeds) {
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
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const listItemHeading = document.createElement('h3');
    listItemHeading.classList.add('h6', 'm-0');
    listItem.append(listItemHeading);
    const listItemDescription = document.createElement('p');
    listItemDescription.classList.add('m-0', 'small', 'text-black-50');
    listItem.append(listItemDescription);

    feeds.forEach((feed) => {
      const item = listItem.cloneNode(true);
      item.querySelector('h3').textContent = feed.title;
      item.querySelector('p').textContent = feed.description;
      list.append(item);
    });

    this.DOM.feeds.append(container);
  }

  renderItems(posts) {
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
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    container.append(list);
    const listItem = document.createElement('li');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    const listItemLink = document.createElement('a');
    listItemLink.classList.add('fw-bold');
    listItemLink.setAttribute('target', '_blank');
    listItemLink.setAttribute('rel', 'noopener noreferrer');
    listItem.append(listItemLink);

    posts.forEach((post) => {
      const item = listItem.cloneNode(true);
      const link = item.querySelector('a');
      link.textContent = post.title;
      link.href = post.url;

      list.append(item);
    });

    this.DOM.posts.append(container);
  }
}
