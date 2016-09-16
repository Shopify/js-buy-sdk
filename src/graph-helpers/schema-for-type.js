import graphSchema from 'graph/schema';

export default function schemaForType(typeName) {
  const type = graphSchema[typeName];

  if (type) {
    return type;
  }

  throw new Error(`No type of ${typeName} found in schema`);
}

