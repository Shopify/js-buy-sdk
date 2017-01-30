import createGid from './create-gid';
import addCollectionFields, {defaultFields} from './collection-fields';

export default function collectionQuery(fields = defaultFields) {
  return function(client, id) {
    return client.query((root) => {
      root.add('node', {args: {id: createGid('Collection', id)}}, (node) => {
        node.addInlineFragmentOn('Collection', (collection) => {
          addCollectionFields(collection, fields);
        });
      });
    });
  };
}
