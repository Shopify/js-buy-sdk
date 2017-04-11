import {defaultFields} from './image-query';

export default function imageConnectionQuery(fields = defaultFields) {
  return function(parentSelection, fieldName) {
    parentSelection.addConnection(fieldName, {args: {first: 250}}, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
