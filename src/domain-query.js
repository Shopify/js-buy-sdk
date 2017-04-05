import baseQuery from './base-query';

const defaultFields = ['host', 'sslEnabled', 'url'];

export default function domainQuery(fields = defaultFields) {
  return baseQuery(fields);
}
