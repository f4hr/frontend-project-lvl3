// @ts-check

import _ from 'lodash';

export default class Validator {
  constructor(validator) {
    this.validator = validator;
  }

  setSchema(schema) {
    this.schema = schema;
  }

  validate(fields) {
    try {
      this.schema.validateSync(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return _.keyBy(e.inner, 'path');
    }
  }
}
