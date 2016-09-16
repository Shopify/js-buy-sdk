import schemaForType from './schema-for-type';
import assign from '../metal/assign';

function findInScalars(fieldName, type) {
  const fieldDescriptor = type.scalars[fieldName];

  if (fieldDescriptor) {
    return assign({
      schema: {
        kind: 'SCALAR',
        name: fieldDescriptor.type
      },
      fieldName,
      onType: type.name
    }, fieldDescriptor);
  }

  return null;
}

function findInObjects(fieldName, type) {
  const fieldDescriptor = type.objects[fieldName];

  if (fieldDescriptor) {
    return assign({
      schema: schemaForType(fieldDescriptor.type),
      fieldName,
      onType: type.name
    }, fieldDescriptor);
  }

  return null;
}

function findInConnections(fieldName, type) {
  const fieldDescriptor = type.connections[fieldName];

  if (fieldDescriptor) {
    return assign({
      schema: schemaForType(fieldDescriptor.type),
      fieldName,
      onType: type.name
    }, fieldDescriptor);
  }

  return null;
}

function find(fieldName, type) {
  return (
    findInScalars(fieldName, type) ||
    findInObjects(fieldName, type) ||
    findInConnections(fieldName, type)
  );
}

export default function rawDescriptorForField(fieldName, typeModuleName) {
  const containerType = schemaForType(typeModuleName);

  if (!containerType) {
    throw new Error(`Unknown parent GraphQL type ${typeModuleName}`);
  }

  return find(fieldName, containerType);
}
