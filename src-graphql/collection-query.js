import createGid from './create-gid';
import addFields from './add-fields';
import defaultFields from './collection-default-fields';

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
