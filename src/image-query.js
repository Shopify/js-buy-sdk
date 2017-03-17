import baseQuery from './base-query';

export default function imageQuery(fields = ['id', 'src', 'altText']) {
  return baseQuery(fields);
}
