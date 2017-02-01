export default function parseFields(fields) {
  const query = {};
  const scalars = [];

  fields.forEach((field) => {
    if (Object.prototype.toString.call(field) === '[object String]') {
      scalars.push(field);
    } else {
      const [fieldName, objectQuery] = field;

      query[fieldName] = objectQuery;
    }
  });

  return [scalars, query];
}
