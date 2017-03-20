import lineItemConnectionQuery from './line-item-connection-query';
import shippingRateQuery from './shipping-rate-query';
import mailingAddressQuery from './mailing-address-query';
import baseQuery from './base-query';

const defaultFields = ['id', 'ready', 'note', 'createdAt', 'updatedAt', 'requiresShipping', ['shippingLine', shippingRateQuery()],
  ['shippingAddress', mailingAddressQuery()], ['lineItems', lineItemConnectionQuery()]];

export default function checkoutQuery(fields = defaultFields) {
  return baseQuery(fields);
}
