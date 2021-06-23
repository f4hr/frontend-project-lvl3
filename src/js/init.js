// @ts-check

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
};

const init = () => {
  const container = document.getElementById('app');
  const view = new View(container, state);

  view.init();
};

export default init;
