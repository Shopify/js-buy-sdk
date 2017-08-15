import {defaultFields} from './collection-node-query';
import addFields from './add-fields';

/**
 * Returns a callback function to build a collection connection query with specified fields.
 * Use this when fetching multiple collections.
 *
 * @example
 * const query = collectionConnectionQuery(['id', 'handle', ['image', imageQuery()]]);
 *
 * @memberof Client.Queries
 * @alias collectionConnectionQuery
 * @param {Array} [fields] A list of fields to query on the collections. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'handle'`</li>
 *     <li>`'description'`</li>
 *     <li>`'descriptionHtml'`</li>
 *     <li>`'updatedAt'`</li>
 *     <li>`'title'`</li>
 *     <li>`['image', imageQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/collection|Storefront API reference} for all possible values.
 */
export default function collectionConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, options) {
    parentSelection.addConnection(fieldName, {args: Object.assign({first: 20}, options)}, (collections) => {
      addFields(collections, fields);
    });
  };
}
