import isString from './is-string';

export default function addFields(object, objectFields) {
  objectFields.forEach((field) => {
    if (isString(field)) {
      object.add(field);
    } else {
      const [fieldName, builder] = field;

      builder(object, fieldName);
    }
  });
}
