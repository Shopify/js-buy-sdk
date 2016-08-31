import graphSchema from 'graph/schema';

function findInFields(fieldName, type) {
  const fieldDescriptor = type.fields[fieldName];

  if (fieldDescriptor) {
    return {
      fieldName,
      typeName: 'Scalar',
      isList: fieldDescriptor.isList
    };
  }

  return null;
}

function findInFieldsWithArgs(fieldName, type) {
  const fieldDescriptor = type.fieldsWithArgs[fieldName];

  if (fieldDescriptor) {
    return {
      fieldName,
      typeName: 'Scalar',
      isList: fieldDescriptor.isList
    };
  }

  return null;
}

function findInRelationships(fieldName, type) {
  const fieldDescriptor = type.relationships[fieldName];

  if (fieldDescriptor) {
    const fieldType = graphSchema[fieldDescriptor.type];

    return {
      fieldName,
      typeName: fieldType.name,
      isList: fieldDescriptor.isList,
      type: fieldType
    };
  }

  return null;
}

function find(fieldName, type) {
  return (
    findInFields(fieldName, type) ||
    findInFieldsWithArgs(fieldName, type) ||
    findInRelationships(fieldName, type)
  );
}

export default function rawDescriptorForField(fieldName, typeModuleName) {
  const containerType = graphSchema[typeModuleName];

  if (!containerType) {
    throw new Error(`Unknown parent GraphQL type ${typeModuleName}`);
  }

  return find(fieldName, containerType);
}
