import baseQuery from './base-query';

export default function customAttributeQuery(fields = ['key', 'value']) {
  return baseQuery(fields);
}
