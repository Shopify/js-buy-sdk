import addFields from './add-fields';
import defaultFields from './collection-default-fields';

export default function collectionConnectionQuery(fields = defaultFields) {
  return function(client) {
    return client.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('collections', {args: {first: 20}}, (collections) => {
          addFields(collections, fields);
        });
      });
    });
  };
}
