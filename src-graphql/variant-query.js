export default function variantQuery(specifiedScalars, specifiedObject) {
  let scalars;
  let selectedOptions;

  if (specifiedScalars || specifiedObject) {
    scalars = specifiedScalars;
    if (specifiedObject) {
      selectedOptions = specifiedObject.selectedOptions;
    }
  } else {
    scalars = ['id', 'title', 'price', 'weight'];
    selectedOptions = selectedOptionQuery();
  }

  return {scalars, selectedOptions};
}

function selectedOptionQuery(specifiedFields) {
  const scalars = specifiedFields ? specifiedFields : ['name', 'value'];

  return {scalars};
}
