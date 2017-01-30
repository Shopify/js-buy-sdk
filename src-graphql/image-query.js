export default function imageQuery(...specifiedFields) {
  const scalars = specifiedFields.length ? specifiedFields : ['id', 'src', 'altText'];

  return {scalars};
}
