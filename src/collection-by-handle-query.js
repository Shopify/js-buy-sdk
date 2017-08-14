import addFields from './add-fields';
import productConnectionQuery from './product-connection-query';
import imageQuery from './image-query';

const defaultFields = [
  'id',
  'handle',
  'description',
  'descriptionHtml',
  'updatedAt',
  'title',
  ['products', productConnectionQuery()],
  ['image', imageQuery()]
];

export default function collectionByHandleQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, handle) {
    parentSelection.add(fieldName, {args: {handle}}, (node) => {
      node.addInlineFragmentOn('Collection', (collection) => {
        addFields(collection, fields);
      });
    });
  };
}
