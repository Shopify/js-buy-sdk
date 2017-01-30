import imageQuery from './image-query';

export default function collectionQuery(specifiedScalars, specifiedObject) {
  let scalars;
  let image;

  if (specifiedScalars || specifiedObject) {
    scalars = specifiedScalars;
    if (specifiedObject) {
      image = specifiedObject.image;
    }
  } else {
    scalars = ['id', 'handle', 'updatedAt', 'title'];
    image = imageQuery();
  }

  return {scalars, image};
}
