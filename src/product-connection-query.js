import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';
import addFields from './add-fields';

const defaultFields = [
  'id',
  'createdAt',
  'updatedAt',
  'descriptionHtml',
  'descriptionPlainSummary',
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

export default function productConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, options) {
    parentSelection.addConnection(fieldName, {args: Object.assign({first: 20}, options)}, (products) => {
      addFields(products, fields);
    });
  };
}
