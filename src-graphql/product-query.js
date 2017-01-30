import optionQuery from './option-query';
import imageQuery from './image-query';
import variantQuery from './variant-query';

export default function productQuery(specifiedScalars, specifiedObjects) {
  let scalars;
  let options;
  let images;
  let variants;

  if (specifiedScalars || specifiedObjects) {
    scalars = specifiedScalars;
    if (specifiedObjects) {
      options = specifiedObjects.options;
      images = specifiedObjects.images;
      variants = specifiedObjects.variants;
    }
  } else {
    scalars = ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType', 'title', 'vendor', 'tags', 'publishedAt'];
    options = optionQuery();
    images = imageQuery();
    variants = variantQuery();
  }

  return {scalars, options, images, variants};
}
