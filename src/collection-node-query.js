import imageQuery from './image-query';
import productConnectionQuery from './product-connection-query';
import nodeQuery from './node-query';

export const defaultFields = ['id', 'handle', 'updatedAt', 'title', ['image', imageQuery()]];

export default function collectionNodeQuery(fields = defaultFields) {
  return nodeQuery('Collection', fields);
}

export function collectionNodeWithProductsQuery() {
  return nodeQuery('Collection', [...defaultFields, ['products', productConnectionQuery()]]);
}
