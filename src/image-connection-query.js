import {defaultFields} from './image-query';

/**
 * Returns a callback function to build an image connection query with specified fields.
 * Use this when fetching multiple images.
 *
 * @example
 * const query = imageConnectionQuery(['id', 'src']);
 *
 * @memberof Client.Queries
 * @alias imageConnectionQuery
 * @param {Array} [fields] A list of fields to query on the images. Default values are:
 *   <ul>
 *     <li>`'id'`</li>
 *     <li>`'src'`</li>
 *     <li>`'altText'`</li>
 *   </ul>
 * See the {@link https://help.shopify.com/api/storefront-api/reference/object/image|Storefront API reference} for all possible values.
 */
export default function imageConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
