import imageQuery from './image-query';
import nodeQuery from './node-query';

export const defaultFields = ['id', 'handle', 'description', 'descriptionHtml', 'updatedAt', 'title', ['image', imageQuery()]];

/**
 * Returns a callback function to build a collection query off the root query with specified fields.
 * Use this when fetching a single collection.
 *
 * @example
 * const query = collectionNodeQuery(['id', 'handle', ['image', imageQuery()]]);
 *
 * @memberof Client.Queries
 * @alias collectionNodeQuery
 * @param {Array} [fields] A list of fields to query on the collections. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'handle'`</li>
 *     <li>`'description'`</li>
 *     <li>`'descriptionHtml'`</li>
 *     <li>`'updatedAt'`</li>
 *     <li>`'title'`</li>
 *     <li>`
 *     <li>`['image', imageQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/collection|Storefront API reference} for all possible values.
 */
export default function collectionNodeQuery(fields = defaultFields) {
  return nodeQuery('Collection', fields);
}
