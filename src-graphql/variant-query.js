export default function variantQuery(...specifiedFields) {
  let scalars;
  let selectedOptions;

  if (specifiedFields.length) {
    scalars = specifiedFields.filter((field) => {
      return Object.prototype.toString.call(field) === '[object String]';
    });

    const [specifiedObject] = specifiedFields.filter((field) => {
      return Object.prototype.toString.call(field) !== '[object String]';
    });

    if (specifiedObject) {
      selectedOptions = selectedOptionQuery(...specifiedObject.selectedOptions.fields);
    }
  } else {
    scalars = ['id', 'title', 'price', 'weight'];
    selectedOptions = selectedOptionQuery();
  }

  return {scalars, selectedOptions};
}

function selectedOptionQuery(...specifiedFields) {
  const scalars = specifiedFields.length ? specifiedFields : ['name', 'value'];

  return {scalars};
}
