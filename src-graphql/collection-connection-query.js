import addCollectionFields, {defaultFields} from './collection-fields';

export default function collectionConnectionQuery(fields = defaultFields) {
  return function(client) {
    return client.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('collections', {args: {first: 20}}, (collections) => {
          addCollectionFields(collections, fields);
        });
      });
    });
  };
}
