// @ts-check

import _ from 'lodash';
import onChange from 'on-change';
import { getText } from './utils';

const getPostData = (id, state) => {
  const { posts } = onChange.target(state);
  return _.find(posts, ['id', id]);
};

const buildWrapper = (title) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const header = document.createElement('div');
  header.classList.add('card-body');
  container.append(header);
  const heading = document.createElement('h2');
  heading.classList.add('card-title', 'h4');
  heading.textContent = title;
  header.append(heading);

  return container;
};

const buildFeed = () => {
  const listItem = document.createElement('li');
  listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  const listItemHeading = document.createElement('h3');
  listItemHeading.classList.add('h6', 'm-0');
  listItem.append(listItemHeading);
  const listItemDescription = document.createElement('p');
  listItemDescription.classList.add('m-0', 'small', 'text-black-50');
  listItem.append(listItemDescription);

  return listItem;
};

const populateFeeds = (container, feeds, listItem) => {
  feeds.forEach((feed) => {
    const item = listItem.cloneNode(true);
    item.querySelector('h3').textContent = feed.title;
    item.querySelector('p').textContent = feed.description;
    container.append(item);
  });
};

const renderFeeds = (feeds, container) => {
  const feedsContainer = container;
  const wrapper = buildWrapper('Фиды');
  const feed = buildFeed();
  const list = document.createElement('ul');

  list.classList.add('list-group', 'border-0', 'rounded-0');
  populateFeeds(list, feeds, feed);
  wrapper.append(list);
  feedsContainer.innerHTML = '';
  feedsContainer.append(wrapper);
};

const buildPost = (i18n) => {
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
  listItemLink.setAttribute('target', '_blank');
  listItemLink.setAttribute('rel', 'noopener noreferrer');
  listItem.append(listItemLink);
  // Button
  const listItemBtn = document.createElement('button');
  listItemBtn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  listItemBtn.setAttribute('type', 'button');
  listItemBtn.dataset.bsToggle = 'modal';
  listItemBtn.dataset.bsTarget = '#modal';
  listItemBtn.textContent = getText('feed.viewBtn', i18n);
  listItem.append(listItemBtn);

  return listItem;
};

const populatePosts = (container, posts, listItem, watchedPosts) => {
  posts.forEach((post) => {
    const item = listItem.cloneNode(true);
    const link = item.querySelector('a');
    const button = item.querySelector('button');
    const linkClass = (watchedPosts.includes(post.id))
      ? ['fw-normal', 'link-secondary']
      : ['fw-bold'];

    link.classList.add(...linkClass);
    link.textContent = post.title;
    link.href = post.link;
    button.dataset.id = post.id;

    container.append(item);
  });
};

const renderPosts = (posts, container, watchedPosts, i18n) => {
  const postsContainer = container;
  const wrapper = buildWrapper('Посты');
  const post = buildPost(i18n);
  const list = document.createElement('ul');

  list.classList.add('list-group', 'border-0', 'rounded-0');
  populatePosts(list, posts, post, watchedPosts);
  wrapper.append(list);
  postsContainer.innerHTML = '';
  postsContainer.append(wrapper);
};

const renderModal = (postId, modal, watchedState, i18n) => {
  const state = watchedState;
  const post = getPostData(postId, state);

  modal.querySelector('.modal-title').textContent = post.title;
  modal.querySelector('.modal-body').textContent = post.description;
  modal.querySelector('.full-article').href = post.link;
  modal.querySelector('.full-article').textContent = getText('postModal.readFull', i18n);
  modal.querySelector('.btn-secondary').textContent = getText('buttons.close', i18n);
  modal.querySelector('.btn-close').setAttribute('aria-label', getText('buttons.close', i18n));
};

const processStateHandler = (processState, elements, i18n) => {
  const { input, submitBtn, feedback } = elements;

  switch (processState) {
    case 'failed':
      input.readOnly = false;
      submitBtn.disabled = false;
      break;
    case 'filling':
      input.readOnly = false;
      submitBtn.disabled = false;
      break;
    case 'sending':
      input.readOnly = true;
      submitBtn.disabled = true;
      break;
    case 'finished':
      input.readOnly = false;
      input.value = '';
      submitBtn.disabled = false;
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.innerHTML = getText('rssForm.success.rssDownloaded', i18n);
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const renderErrors = (errors, elements, watchedState, i18n) => {
  const { input, feedback } = elements;
  const state = watchedState;
  const error = errors.url;

  if (feedback) {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  }

  if (error) {
    feedback.textContent = getText(state.form.errors.url.message, i18n);
    input.classList.add('is-invalid');
  }
};

export {
  renderFeeds,
  renderPosts,
  renderModal,
  renderErrors,
  processStateHandler,
};
