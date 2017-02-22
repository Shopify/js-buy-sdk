import createGid from './create-gid';
import optionQuery from './option-query';
import imageConnectionQuery from './image-connection-query';
import variantConnectionQuery from './variant-connection-query';
import addFields from './add-fields';

const defaultFields = ['id', 'createdAt', 'updatedAt', 'descriptionHtml', 'descriptionPlainSummary', 'handle', 'productType', 'title', 'vendor', 'tags',
  'publishedAt', ['options', optionQuery()], ['images', imageConnectionQuery()], ['variants', variantConnectionQuery()]];

export default function productQuery(fields = defaultFields) {
  return function(client, id) {
    return client.query((root) => {
      root.add('node', {args: {id: createGid('Product', id)}}, (node) => {
        node.addInlineFragmentOn('Product', (product) => {
          addFields(product, fields);
        });
      });
    });
  };
}
