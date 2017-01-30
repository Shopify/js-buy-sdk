export default function optionQuery(specifiedScalars) {
  const scalars = specifiedScalars ? specifiedScalars : ['id', 'name', 'values'];

  return {scalars};
}
