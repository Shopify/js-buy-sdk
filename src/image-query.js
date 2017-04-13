import baseQuery from './base-query';

export const defaultFields = ['id', 'src', 'altText'];

/**
 * Returns a callback function to build an image query with specified fields.
 * Use this when fetching a single image.
 *
 * @example
 * const query = imageQuery(['id', 'src']);
 *
 * @memberof Client.Queries
 * @alias imageQuery
 * @param {Array} [fields] A list of fields to query on the image. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'src'`</li>
 *     <li>`'altText'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/image|Storefront API reference} for all possible values.
 */
export default function imageQuery(fields = defaultFields) {
  return baseQuery(fields);
}
