import isString from './is-string';

const defaultFields = ['id', 'title', 'price', 'weight', ['selectedOptions', selectedOptionQuery()]];

function selectedOptionQuery(fields = ['name', 'value']) {
  return function(parentQuery, fieldName) {
    parentQuery.add(fieldName, (selectedOptions) => {
      fields.forEach((field) => {
        selectedOptions.add(field);
      });
    });
  };
}

export default function variantConnectionQuery(fields = defaultFields) {
  return function(parentQuery, fieldName) {
    parentQuery.addConnection(fieldName, {args: {first: 20}}, (variant) => {
      fields.forEach((field) => {
        if (isString(field)) {
          variant.add(field);
        } else {
          const [variantFieldName, builder] = field;

          builder(variant, variantFieldName);
        }
      });
    });
  };
}
