import addFields from './add-fields';
import {defaultFields} from './variant-query';

/**
 * Returns a callback function to build a product variant connection query with specified fields.
 * Use this when fetching multiple variants.
 *
 * @example
 * const query = variantConnectionQuery(['id', 'handle', ['image', imageQuery()]]);
 *
 * @memberof Client.Queries
 * @alias variantConnectionQuery
 * @param {Array} [fields] A list of fields to query on the variants. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'title'`</li>
 *     <li>`'price'`</li>
 *     <li>`'weight'`</li>
 *     <li>`['image', imageQuery()]`</li>
 *     <li>`['selectedOptions', selectedOptionQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/productvariant|Storefront API reference} for all possible values.
 */
export default function variantConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (variant) => {
      addFields(variant, fields);
    });
  };
}
