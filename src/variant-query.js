import selectedOptionQuery from './selected-option-query';
import imageQuery from './image-query';
import baseQuery from './base-query';

export const defaultFields = [
  'id',
  'title',
  'price',
	'compareAtPrice',
  'weight',
  'available',
  ['image', imageQuery()],
  ['selectedOptions', selectedOptionQuery()]
];

/**
 * Returns a callback function to build a product variant query with specified fields.
 * Use this when fetching a single variant.
 *
 * @example
 * const query = variantQuery(['id', 'src']);
 *
 * @memberof Client.Queries
 * @alias variantQuery
 * @param {Array} [fields] A list of fields to query on the variants. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'title'`</li>
 *     <li>`'price'`</li>
 *     <li>`'compareAtPrice'`</li>
 *     <li>`'weight'`</li>
 *     <li>`'available'`</li>
 *     <li>`['image', imageQuery()]`</li>
 *     <li>`['selectedOptions', selectedOptionQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/productvariant|Storefront API reference} for all possible values.
 */
export default function variantQuery(fields = defaultFields) {
  return baseQuery(fields);
}
