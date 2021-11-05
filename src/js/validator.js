// @ts-check

import * as yup from 'yup';

export default (fields, feeds) => {
  const schema = yup.object().shape({
    url: yup.string().required().url().notOneOf(feeds),
  });

  return schema.validate(fields, { abortEarly: true });
};
