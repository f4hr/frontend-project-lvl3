// @ts-check

import _ from 'lodash';

const validatorData = {};

const initValidator = (schema) => {
  validatorData.schema = schema;
};

export default (fields) => {
  try {
    validatorData.schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};
export { initValidator };
