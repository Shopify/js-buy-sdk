import createGid from './create-gid';
import imageQuery from './image-query';
import addFields from './add-fields';

const defaultFields = ['id', 'handle', 'updatedAt', 'title', ['image', imageQuery()]];

export default function collectionQuery(fields = defaultFields) {
  return function(client, id) {
    return client.query((root) => {
      root.add('node', {args: {id: createGid('Collection', id)}}, (node) => {
        node.addInlineFragmentOn('Collection', (collection) => {
          addFields(collection, fields);
        });
      });
    });
  };
}
