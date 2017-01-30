import imageQuery from './image-query';
import isString from './is-string';

export const defaultFields = ['id', 'handle', 'updatedAt', 'title', ['image', imageQuery()]];

export default function addCollectionFields(collection, collectionFields) {
  collectionFields.forEach((field) => {
    if (isString(field)) {
      collection.add(field);
    } else {
      const [fieldName, builder] = field;

      builder(collection, fieldName);
    }
  });
}
