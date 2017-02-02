import imageQuery from './image-query';
import createGid from './create-gid';

export default function collectionQuery({client, id}, fields = ['id', 'handle', 'updatedAt', 'title', ['image', imageQuery()]]) {
  let query;

  if (id) {
    query = client.query((root) => {
      root.add('collection', {args: {id: createGid('Collection', id)}}, (collection) => {
        addCollectionFields(collection, fields);
      });
    });
  } else {
    query = client.query((root) => {
      root.add('shop', (shop) => {
        shop.addConnection('collections', {args: {first: 20}}, (collections) => {
          addCollectionFields(collections, fields);
        });
      });
    });
  }

  return query;
}

function addCollectionFields(collection, collectionFields) {
  collectionFields.forEach((field) => {
    if (Object.prototype.toString.call(field) === '[object String]') {
      collection.add(field);
    } else {
      const [fieldName, builder] = field;

      builder(collection, fieldName);
    }
  });
}
