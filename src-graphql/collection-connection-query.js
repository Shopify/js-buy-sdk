import imageQuery from './image-query';
import addFields from './add-fields';

const defaultFields = ['id', 'handle', 'updatedAt', 'title', ['image', imageQuery()]];

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
