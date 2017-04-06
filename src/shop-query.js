import baseQuery from './base-query';
import domainQuery from './domain-query';

const defaultFields = [
  'currencyCode',
  'description',
  'moneyFormat',
  'name',
  ['primaryDomain', domainQuery()]
];

export default function shopQuery(fields = defaultFields) {
  return baseQuery(fields);
}
