import baseQuery from './base-query';

export default function optionQuery(fields = ['id', 'name', 'values']) {
  return baseQuery(fields);
}
