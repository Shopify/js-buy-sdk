import createGid from './create-gid';
import addFields from './add-fields';
import defaultFields from './product-default-fields';

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
