import addFields from './add-fields';
import defaultFields from './product-default-fields';

export default function productConnectionQuery(fields = defaultFields) {
  return function(client) {
    return client.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('products', {args: {first: 20}}, (products) => {
          addFields(products, fields);
        });
      });
    });
  };
}
