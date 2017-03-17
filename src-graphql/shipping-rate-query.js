import baseQuery from './base-query';

export default function shippingRateQuery(fields = ['handle', 'price', 'title']) {
  return baseQuery(fields);
}
