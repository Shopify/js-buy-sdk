import baseQuery from './base-query';

/**
 * Returns a callback function to build a shipping rate query with specified fields.
 *
 * @example
 * const query = shippingRateQuery(['price', 'title']);
 *
 * @memberof Client.Queries
 * @alias shippingRateQuery
 * @param {Array} [fields] A list of fields to query on the shipping rate. Default values are:
 *   <ul>
 *     <li>`'handle'`</li>
 *     <li>`'price'`</li>
 *     <li>`'title'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/shippingrate|Storefront API reference} for all possible values.
 */
export default function shippingRateQuery(fields = ['handle', 'price', 'title']) {
  return baseQuery(fields);
}
