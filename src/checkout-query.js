import lineItemConnectionQuery from './line-item-connection-query';
import shippingRateQuery from './shipping-rate-query';
import mailingAddressQuery from './mailing-address-query';
import baseQuery from './base-query';
import customAttributeQuery from './custom-attribute-query';
import orderQuery from './order-query';
import nodeQuery from './node-query';

const defaultFields = [
  'id',
  'ready',
  ['lineItems', lineItemConnectionQuery()],
  ['shippingAddress', mailingAddressQuery()],
  ['shippingLine', shippingRateQuery()],
  'requiresShipping',
  ['customAttributes', customAttributeQuery()],
  'note',
  'paymentDue',
  'webUrl',
  ['order', orderQuery()],
  'orderStatusUrl',
  'taxExempt',
  'taxesIncluded',
  'currencyCode',
  'totalTax',
  'subtotalPrice',
  'totalPrice',
  'completedAt',
  'createdAt',
  'updatedAt'
];

export default function checkoutQuery(fields = defaultFields) {
  return baseQuery(fields);
}

export function checkoutNodeQuery(fields = defaultFields) {
  return nodeQuery('Checkout', fields);
}
