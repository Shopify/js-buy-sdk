import {defaultFields} from './collection-node-query';
import addFields from './add-fields';

export default function collectionConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName, options) {
    parentSelection.addConnection(fieldName, {args: Object.assign({first: 20}, options)}, (collections) => {
      addFields(collections, fields);
    });
  };
}
