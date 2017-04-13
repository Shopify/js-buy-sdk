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

/**
 * Returns a callback function to build a checkout query with specified fields.
 * Use this for {@link Client#createCheckout}, {@link Client#addLineItems}, {@link Client#updateLineItems}, and {@link Client#removeLineItems}.
 * @example
 * const query = checkoutQuery(['id', 'createdAt', ['lineItems', lineItemConnectionQuery()]]);
 *
 * @memberof Client.Queries
 * @alias checkoutQuery
 * @param {Array} [fields] A list of fields to query on the checkout. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'ready'`</li>
 *     <li>`['lineItems', lineItemConnectionQuery()]`</li>
 *     <li>`['shippingAddress', mailingAddressQuery()]`</li>
 *     <li>`['shippingLine', shippingRateQuery()]`</li>
 *     <li>`'requiresShipping'`</li>
 *     <li>`['customAttributes', customAttributeQuery()]`</li>
 *     <li>`'note'`</li>
 *     <li>`'paymentDue'`</li>
 *     <li>`'webUrl'`</li>
 *     <li>`['order', orderQuery()]`</li>
 *     <li>`'orderStatusUrl'`</li>
 *     <li>`'taxExempt'`</li>
 *     <li>`'taxesIncluded'`</li>
 *     <li>`'currencyCode'`</li>
 *     <li>`'totalTax'`</li>
 *     <li>`'subtotalPrice'`</li>
 *     <li>`'totalPrice'`</li>
 *     <li>`'completedAt'`</li>
 *     <li>`'createdAt'`</li>
 *     <li>`'updatedAt'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/checkout|Storefront API reference} for all possible values.
 */
export default function checkoutQuery(fields = defaultFields) {
  return baseQuery(fields);
}

/**
 * Returns a callback function to build a checkout query off the root query with specified fields.
 * Use this for {@link Client#fetchCheckout}.
 *
 * @example
 * const query = checkoutNodeQuery(['id', 'createdAt', ['lineItems', lineItemConnectionQuery()]]);
 *
 * @memberof Client.Queries
 * @alias checkoutNodeQuery
 * @param {Array} [fields] A list of fields to query on the checkout. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'ready'`</li>
 *     <li>`['lineItems', lineItemConnectionQuery()]`</li>
 *     <li>`['shippingAddress', mailingAddressQuery()]`</li>
 *     <li>`['shippingLine', shippingRateQuery()]`</li>
 *     <li>`'requiresShipping'`</li>
 *     <li>`['customAttributes', customAttributeQuery()]`</li>
 *     <li>`'note'`</li>
 *     <li>`'paymentDue'`</li>
 *     <li>`'webUrl'`</li>
 *     <li>`['order', orderQuery()]`</li>
 *     <li>`'orderStatusUrl'`</li>
 *     <li>`'taxExempt'`</li>
 *     <li>`'taxesIncluded'`</li>
 *     <li>`'currencyCode'`</li>
 *     <li>`'totalTax'`</li>
 *     <li>`'subtotalPrice'`</li>
 *     <li>`'totalPrice'`</li>
 *     <li>`'completedAt'`</li>
 *     <li>`'createdAt'`</li>
 *     <li>`'updatedAt'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/checkout|Storefront API reference} for all possible values.
 */
export function checkoutNodeQuery(fields = defaultFields) {
  return nodeQuery('Checkout', fields);
}
