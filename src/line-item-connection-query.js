import addFields from './add-fields';
import customAttributeQuery from './custom-attribute-query';
import variantQuery from './variant-query';

const defaultFields = ['title', ['variant', variantQuery()], 'quantity', ['customAttributes', customAttributeQuery()]];

/**
 * Returns a callback function to build a line item connection query with specified fields.
 * Use this when fetching multiple line items.
 *
 * @example
 * const query = lineItemConnectionQuery(['quantity', ['variant', variantQuery()]]);
 *
 * @memberof Client.Queries
 * @alias lineItemConnectionQuery
 * @param {Array} [fields] A list of fields to query on the line items. Default values are:
 *   <ul>
 *     <li>`'title'`</li>
 *     <li>`['variant', variantQuery()]`</li>
 *     <li>`'quantity'`</li>
 *     <li>`['customAttributes', customAttributeQuery()]`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/checkoutlineitem|Storefront API reference} for all possible values.
 */
export default function lineItemConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (lineItems) => {
      addFields(lineItems, fields);
    });
  };
}
