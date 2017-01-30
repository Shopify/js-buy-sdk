import imageQuery from './image-query';

export default function collectionQuery(...specifiedFields) {
  let scalars;
  let image;

  if (specifiedFields.length) {
    scalars = specifiedFields.filter((field) => {
      return Object.prototype.toString.call(field) === '[object String]';
    });

    const [specifiedObject] = specifiedFields.filter((field) => {
      return Object.prototype.toString.call(field) !== '[object String]';
    });

    if (specifiedObject) {
      image = imageQuery(...specifiedObject.image.fields);
    }
  } else {
    scalars = ['id', 'handle', 'updatedAt', 'title'];
    image = imageQuery();
  }

  return {scalars, image};
}
