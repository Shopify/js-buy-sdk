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

/**
 * Returns a callback function to build an order query with specified fields.
 *
 * @example
 * const query = orderQuery(['totalRefunded', 'cancelReason']);
 *
 * @memberof Client.Queries
 * @alias orderQuery
 * @param {Array} [fields] A list of fields to query on the order. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'cancelReason'`</li>
 *     <li>`'cancelledAt'`</li>
 *     <li>`'createdAt'`</li>
 *     <li>`'updatedAt'`</li>
 *     <li>`'processedAt'`</li>
 *     <li>`'orderNumber'`</li>
 *     <li>`'subtotalPrice'`</li>
 *     <li>`'totalShippingPrice'`</li>
 *     <li>`'totalTax'`</li>
 *     <li>`'totalPrice'`</li>
 *     <li>`'currencyCode'`</li>
 *     <li>`'totalRefunded'`</li>
 *     <li>`'displayFulfillmentStatus'`</li>
 *     <li>`'displayFinancialStatus'`</li>
 *     <li>`'customerUrl'`</li>
 *     <li>`['shippingAddress', mailingAddressQuery()]`</li>
 *     <li>`['lineItems', lineItemConnectionQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/order|Storefront API reference} for all possible values.
 */
export default function orderQuery(fields = defaultFields) {
  return baseQuery(fields);
}
