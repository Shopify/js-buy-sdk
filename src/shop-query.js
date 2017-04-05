import baseQuery from './base-query';
import domainQuery from './domain-query';
import shopPolicyQuery from './shop-policy-query';

const defaultFields = [
  'currencyCode',
  'description',
  'moneyFormat',
  'name',
  ['primaryDomain', domainQuery()],
  ['privacyPolicy', shopPolicyQuery()],
  ['termsOfService', shopPolicyQuery()],
  ['refundPolicy', shopPolicyQuery()]
];

export default function shopQuery(fields = defaultFields) {
  return baseQuery(fields);
}
