import addFields from './add-fields';
import {defaultFields} from './product-node-query';

/**
 * Returns a callback function to build a product connection query with specified fields.
 * Use this when fetching multiple products.
 *
 * @example
 * const query = productConnectionQuery(['id', 'handle', ['image', imageQuery()]]);
 *
 * @memberof Client.Queries
 * @alias productConnectionQuery
 * @param {Array} [fields] A list of fields to query on the products. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'createdAt'`</li>
 *     <li>`'updatedAt'`</li>
 *     <li>`'descriptionHtml'`</li>
 *     <li>`'description'`</li>
 *     <li>`'handle'`</li>
 *     <li>`'productType'`</li>
 *     <li>`'title'`</li>
 *     <li>`'vendor'`</li>
 *     <li>`'tags'`</li>
 *     <li>`'publishedAt'`</li>
 *     <li>`['options', optionQuery()]`</li>
 *     <li>`['images', imageConnectionQuery()]`</li>
 *     <li>`['variants', variantConnectionQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/product|Storefront API reference} for all possible values.
 */
export default function productConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, options) {
    parentSelection.addConnection(fieldName, {args: Object.assign({first: 20}, options)}, (products) => {
      addFields(products, fields);
    });
  };
}
