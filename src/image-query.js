import baseQuery from './base-query';

export const defaultFields = ['id', 'src', 'altText'];

export default function imageQuery(fields = defaultFields) {
  return baseQuery(fields);
}
