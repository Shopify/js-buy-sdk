import baseQuery from './base-query';

const defaultFields = ['id', 'title', 'url', 'body'];

export default function shopPolicyQuery(fields = defaultFields) {
  return baseQuery(fields);
}
