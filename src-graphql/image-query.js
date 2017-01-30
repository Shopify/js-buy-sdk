export default function imageQuery(fields = ['id', 'src', 'altText']) {
  return function(parentQuery, fieldName) {
    parentQuery.add(fieldName, (image) => {
      fields.forEach((field) => {
        image.add(field);
      });
    });
  };
}
