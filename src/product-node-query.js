import createGid from './create-gid';
import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';
import addFields from './add-fields';

const defaultFields = [
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

export default function productNodeQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, id) {
    parentSelection.add(fieldName, {args: {id: createGid('Product', id)}}, (node) => {
      node.addInlineFragmentOn('Product', (product) => {
        addFields(product, fields);
      });
    });
  };
}
