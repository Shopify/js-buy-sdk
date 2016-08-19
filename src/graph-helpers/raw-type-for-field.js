import graphSchema from 'graph/schema';
import assign from '../metal/assign';

function findInFields(property, type) {
  const propertyDescriptor = type.fields[property];

  if (propertyDescriptor) {
    return {
      name: 'Scalar',
      isList: propertyDescriptor.isList
    };
  }

  return null;
}

function findInFieldsWithArgs(property, type) {
  const propertyDescriptor = type.fieldsWithArgs[property];

  if (propertyDescriptor) {
    return {
      name: 'Scalar',
      isList: propertyDescriptor.isList
    };
  }

  return null;
}

function findInRelationships(property, type) {
  const propertyDescriptor = type.relationships[property];

  if (propertyDescriptor) {
    const propertyType = graphSchema[propertyDescriptor.schemaModule];

    return assign({ isList: propertyDescriptor.isList }, propertyType);
  }

  return null;
}

function find(property, type) {
  return (
    findInFields(property, type) ||
    findInFieldsWithArgs(property, type) ||
    findInRelationships(property, type)
  );
}

export default function rawTypeForField(property, typeModuleName) {
  const containerType = graphSchema[typeModuleName];

  return find(property, containerType);
}
