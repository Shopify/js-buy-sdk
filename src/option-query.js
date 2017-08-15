import baseQuery from './base-query';

/**
 * Returns a callback function to build an options query with specified fields.
 *
 * @example
 * const query = optionQuery(['name']);
 *
 * @memberof Client.Queries
 * @alias optionQuery
 * @param {Array} [fields] A list of fields to query on the options. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'name'`</li>
 *     <li>`'values'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/productoption|Storefront API reference} for all possible values.
 */
export default function optionQuery(fields = ['id', 'name', 'values']) {
  return baseQuery(fields);
}
