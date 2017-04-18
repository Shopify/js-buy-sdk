import baseQuery from './base-query';

const defaultFields = ['host', 'sslEnabled', 'url'];

/**
 * Returns a callback function to build a domain query with specified fields.
 *
 * @example
 * const query = domainQuery(['url']);
 *
 * @memberof Client.Queries
 * @alias domainQuery
 * @param {Array} [fields] A list of fields to query on the domain. Default values are:
 *   <ul>
 *     <li>`'host'`</li>
 *     <li>`'sslEnabled'`</li>
 *     <li>`'url'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/domain|Storefront API reference} for all possible values.
 */
export default function domainQuery(fields = defaultFields) {
  return baseQuery(fields);
}
