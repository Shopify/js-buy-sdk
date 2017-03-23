import lineItemConnectionQuery from './line-item-connection-query';
import shippingRateQuery from './shipping-rate-query';
import mailingAddressQuery from './mailing-address-query';
import baseQuery from './base-query';
import customAttributeQuery from './custom-attribute-query';

const defaultFields = [
  'id',
  'ready',
  'note',
  'createdAt',
  'updatedAt',
  'requiresShipping',
  ['customAttributes', customAttributeQuery()],
  ['shippingLine', shippingRateQuery()],
  ['shippingAddress', mailingAddressQuery()],
  ['lineItems', lineItemConnectionQuery()]
];

export default function checkoutQuery(fields = defaultFields) {
  return baseQuery(fields);
}
