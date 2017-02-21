import imageQuery from './image-query';
import addFields from './add-fields';

const defaultFields = ['id', 'handle', 'updatedAt', 'title', ['image', imageQuery()]];

export default function collectionConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, options) {
    parentSelection.addConnection(fieldName, {args: Object.assign({first: 20}, options)}, (collections) => {
      addFields(collections, fields);
    });
  };
}
