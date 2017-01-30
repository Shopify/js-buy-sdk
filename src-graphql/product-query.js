import createGid from './create-gid';
import addProductFields, {defaultFields} from './product-fields';

export default function productQuery(fields = defaultFields) {
  return function(client, id) {
    return client.query((root) => {
      root.add('node', {args: {id: createGid('Product', id)}}, (node) => {
        node.addInlineFragmentOn('Product', (product) => {
          addProductFields(product, fields);
        });
      });
    });
  };
}
