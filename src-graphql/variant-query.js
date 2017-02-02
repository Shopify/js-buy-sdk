export default function variantQuery(fields = ['id', 'title', 'price', 'weight', ['selectedOptions', selectedOptionQuery()]]) {
  return function(parentQuery, fieldName) {
    parentQuery.addConnection(fieldName, {args: {first: 20}}, (variant) => {
      fields.forEach((field) => {
        if (Object.prototype.toString.call(field) === '[object String]') {
          variant.add(field);
        } else {
          const [variantFieldName, builder] = field;

          builder(variant, variantFieldName);
        }
      });
    });
  };
}

function selectedOptionQuery(fields = ['name', 'value']) {
  return function(parentQuery, fieldName) {
    parentQuery.add(fieldName, (selectedOptions) => {
      fields.forEach((field) => {
        selectedOptions.add(field);
      });
    });
  };
}
