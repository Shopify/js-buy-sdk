export default function optionQuery(specifiedFields = ['id', 'name', 'values']) {
  const scalars = specifiedFields;

  return {scalars};
}
