export default function imageQuery(specifiedScalars) {
  const scalars = specifiedScalars ? specifiedScalars : ['id', 'src', 'altText'];

  return {scalars};
}
