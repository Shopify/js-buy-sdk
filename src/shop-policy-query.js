import baseQuery from './base-query';

const defaultFields = ['id', 'title', 'url', 'body'];

/**
 * Returns a callback function to build a shop policy query with specified fields.
 *
 * @example
 * const query = shopPolicyQuery(['title', 'body']);
 *
 * @memberof Client.Queries
 * @alias shopPolicyQuery
 * @param {Array} [fields] A list of fields to query on the shop policy. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'title'`</li>
 *     <li>`'url'`</li>
 *     <li>`'body'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/shoppolicy|Storefront API reference} for all possible values.
 */
export default function shopPolicyQuery(fields = defaultFields) {
  return baseQuery(fields);
}
