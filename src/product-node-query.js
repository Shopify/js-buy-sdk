import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';
import nodeQuery from './node-query';

export const defaultFields = [
  'id',
  'createdAt',
  'updatedAt',
  'descriptionHtml',
  'description',
  'handle',
  'productType',
  'title',
  'vendor',
  'tags',
  'publishedAt',
  ['options', optionQuery()],
  ['images', imageConnectionQuery()],
  ['variants', variantConnectionQuery()]
];

/**
 * Returns a callback function to build a product query off the root query with specified fields.
 * Use this when fetching a single product.
 *
 * @example
 * const query = productNodeQuery(['id', 'handle', ['image', imageQuery()]]);
 *
 * @memberof Client.Queries
 * @alias productNodeQuery
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
export default function productNodeQuery(fields = defaultFields) {
  return nodeQuery('Product', fields);
}
