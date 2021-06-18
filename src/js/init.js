// @ts-check

import View from './View';

const state = {
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
  const view = new View(container);

  view.init(state);
};

export default init;
