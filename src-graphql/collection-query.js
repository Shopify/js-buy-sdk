import imageQuery from './image-query';
import parseFields from './parse-fields';

export default function collectionQuery(specifiedFields) {
  let scalars;
  let query;

  if (specifiedFields) {
    [scalars, query] = parseFields(specifiedFields);
  } else {
    scalars = ['id', 'handle', 'updatedAt', 'title'];
    query = {image: imageQuery()};
  }
  query.scalars = scalars;

  return query;
}
