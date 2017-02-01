import optionQuery from './option-query';
import imageQuery from './image-query';
import variantQuery from './variant-query';
import parseFields from './parse-fields';

export default function productQuery(specifiedFields) {
  let scalars;
  let query;

  if (specifiedFields) {
    [scalars, query] = parseFields(specifiedFields);
  } else {
    scalars = ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType', 'title', 'vendor', 'tags', 'publishedAt'];
    query = {options: optionQuery(), images: imageQuery(), variants: variantQuery()};
  }
  query.scalars = scalars;

  return query;
}
