import descriptorForField from './descriptor-for-field';
import ClassRegistry from './class-registry';
import assign from '../metal/assign';

function extractDescriptors(objectGraph, typeName) {
  return Object.keys(objectGraph).map(fieldName => {
    return descriptorForField(fieldName, typeName);
  });
}

function isAttr(descriptor) {
  return descriptor.typeName === 'Scalar';
}

function isSingularRelationship(descriptor) {
  return !(descriptor.isList || isAttr(descriptor));
}

function isRelationshipList(descriptor) {
  return descriptor.isList && !isAttr(descriptor);
}

export default function deserializeObject(objectGraph, typeName, registry = new ClassRegistry()) {
  const descriptors = extractDescriptors(objectGraph, typeName);
  const relationshipDescriptors = descriptors.filter(isSingularRelationship);
  const relationshipListDescriptors = descriptors.filter(isRelationshipList);
  const attrDescriptors = descriptors.filter(isAttr);

  const attrs = attrDescriptors.reduce((attrAcc, descriptor) => {
    attrAcc[descriptor.fieldName] = objectGraph[descriptor.fieldName];

    return attrAcc;
  }, {});

  const relationships = relationshipDescriptors.reduce((relationshipAcc, descriptor) => {
    relationshipAcc[descriptor.fieldName] = deserializeObject(objectGraph[descriptor.fieldName], descriptor.typeName, registry);

    return relationshipAcc;
  }, {});

  const relationshipLists = relationshipListDescriptors.reduce((relationshipListsAcc, descriptor) => {
    if (descriptor.isPaginated) {
      relationshipListsAcc[descriptor.fieldName] = objectGraph[descriptor.fieldName].edges.map(object => {
        return deserializeObject(object.node, descriptor.typeName, registry);
      });
    } else {
      relationshipListsAcc[descriptor.fieldName] = objectGraph[descriptor.fieldName].map(object => {
        return deserializeObject(object, descriptor.typeName, registry);
      });
    }

    return relationshipListsAcc;
  }, {});

  const model = new (registry.classForType(typeName))(attrs);

  assign(model, relationships, relationshipLists);

  return model;
}
