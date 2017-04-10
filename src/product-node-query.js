import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';
import nodeQuery from './node-query';

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
  return nodeQuery('Product', fields);
}
