import baseQuery from './base-query';

/**
 * Returns a callback function to build a selection option query with specified fields.
 *
 * @example
 * const query = selectedOptionQuery(['name']);
 *
 * @memberof Client.Queries
 * @alias selectedOptionQuery
 * @param {Array} [fields] A list of fields to query on the selected option. Default values are:
 *   <ul>
 *     <li>`'name'`</li>
 *     <li>`'value'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/selectedoption|Storefront API reference} for all possible values.
 */
export default function selectedOptionQuery(fields = ['name', 'value']) {
  return baseQuery(fields);
}
