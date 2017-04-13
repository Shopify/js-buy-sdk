import baseQuery from './base-query';

/**
 * Returns a callback function to build a custom attribute query with specified fields.
 *
 * @example
 * const query = customAttributeQuery(['key']);
 *
 * @memberof Client.Queries
 * @alias customAttributeQuery
 * @param {Array} [fields] A list of fields to query on the custom attribute. Default values are:
 *   <ul>
 *     <li>`'key'`</li>
 *     <li>`'value'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/attribute|Storefront API reference} for all possible values.
 */
export default function customAttributeQuery(fields = ['key', 'value']) {
  return baseQuery(fields);
}
