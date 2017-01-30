import addProductFields, {defaultFields} from './product-fields';

export default function productConnectionQuery(fields = defaultFields) {
  return function(client) {
    return client.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('products', {args: {first: 20}}, (products) => {
          addProductFields(products, fields);
        });
      });
    });
  };
}
