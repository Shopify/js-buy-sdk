import baseQuery from './base-query';
import mailingAddressQuery from './mailing-address-query';
import lineItemConnectionQuery from './line-item-connection-query';

const defaultFields = [
  'id',
  'cancelReason',
  'cancelledAt',
  'createdAt',
  'updatedAt',
  'processedAt',
  'orderNumber',
  'subtotalPrice',
  'totalShippingPrice',
  'totalTax',
  'totalPrice',
  'currencyCode',
  'totalRefunded',
  'displayFulfillmentStatus',
  'displayFinancialStatus',
  'customerUrl',
  ['shippingAddress', mailingAddressQuery()],
  ['lineItems', lineItemConnectionQuery()]
];

export default function orderQuery(fields = defaultFields) {
  return baseQuery(fields);
}
