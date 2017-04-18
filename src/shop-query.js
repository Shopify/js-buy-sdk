import baseQuery from './base-query';
import domainQuery from './domain-query';

const defaultFields = [
  'currencyCode',
  'description',
  'moneyFormat',
  'name',
  ['primaryDomain', domainQuery()]
];

/**
 * Returns a callback function to build a shop query with specified fields.
 *
 * @example
 * const query = shopQuery(['name', 'description', ['primaryDomain', domainQuery()]]);
 *
 * @memberof Client.Queries
 * @alias shopQuery
 * @param {Array} [fields] A list of fields to query on the shop. Default values are:
 *   <ul>
 *     <li>`'currencyCode'`</li>
 *     <li>`'description'`</li>
 *     <li>`'moneyFormat'`</li>
 *     <li>`'name'`</li>
 *     <li>`['primaryDomain', domainQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/shop|Storefront API reference} for all possible values.
 * @private
 */
export default function shopQuery(fields = defaultFields) {
  return baseQuery(fields);
}
