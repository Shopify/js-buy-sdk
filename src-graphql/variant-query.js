import parseFields from './parse-fields';

export default function variantQuery(specifiedFields) {
  let scalars;
  let query;

  if (specifiedFields) {
    [scalars, query] = parseFields(specifiedFields);
  } else {
    scalars = ['id', 'title', 'price', 'weight'];
    query = {selectedOptions: selectedOptionQuery()};
  }
  query.scalars = scalars;

  return query;
}

function selectedOptionQuery(specifiedFields = ['name', 'value']) {
  const scalars = specifiedFields;

  return {scalars};
}
