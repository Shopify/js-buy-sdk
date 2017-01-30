import optionQuery from './option-query';
import imageQuery from './image-query';
import variantQuery from './variant-query';

export default function productQuery(...specifiedFields) {
  let scalars;
  let options;
  let images;
  let variants;

  if (specifiedFields.length) {
    scalars = specifiedFields.filter((field) => {
      return Object.prototype.toString.call(field) === '[object String]';
    });

    const specifiedObjects = specifiedFields.filter((field) => {
      return Object.prototype.toString.call(field) !== '[object String]';
    });

    specifiedObjects.forEach((object) => {
      if (object.options) {
        options = optionQuery(...object.options.fields);
      } else if (object.images) {
        images = imageQuery(...object.images.fields);
      } else {
        variants = variantQuery(...object.variants.fields);
      }
    });
  } else {
    scalars = ['id', 'createdAt', 'updatedAt', 'bodyHtml', 'handle', 'productType', 'title', 'vendor', 'tags', 'publishedAt'];
    options = optionQuery();
    images = imageQuery();
    variants = variantQuery();
  }

  return {scalars, options, images, variants};
}
