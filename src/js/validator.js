// @ts-check

import * as yup from 'yup';
import { getFeedsUrl } from './utils';

export default (fields, state) => {
  const schema = yup.object().shape({
    url: yup.string().required().url().notOneOf(getFeedsUrl(state)),
  });

  return schema.validate(fields, { abortEarly: true });
};
