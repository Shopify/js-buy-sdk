export default function optionQuery(...specifiedFields) {
  const scalars = specifiedFields.length ? specifiedFields : ['id', 'name', 'values'];

  return {scalars};
}
