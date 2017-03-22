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
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 20}}, (products) => {
      addFields(products, fields);
    });
  };
}
