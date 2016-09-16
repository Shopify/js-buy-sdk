import descriptorForField from './descriptor-for-field';
import ClassRegistry from './class-registry';
import assign from '../metal/assign';

function extractDescriptors(objectGraph, typeName) {
  return Object.keys(objectGraph).map(fieldName => {
    return descriptorForField(fieldName, typeName);
  });
}

function isScalar(descriptor) {
  return descriptor.kind === 'SCALAR';
}

function isObject(descriptor) {
  return descriptor.kind === 'OBJECT' && !descriptor.isConnection;
}

function isConnection(descriptor) {
  return descriptor.isConnection;
}

export default function deserializeObject(objectGraph, typeName, registry = new ClassRegistry()) {
  const descriptors = extractDescriptors(objectGraph, typeName);

  const scalarDescriptors = descriptors.filter(isScalar);
  const objectDescriptors = descriptors.filter(isObject);
  const connectionDescriptors = descriptors.filter(isConnection);

  const scalars = scalarDescriptors.reduce((scalarAcc, descriptor) => {
    scalarAcc[descriptor.fieldName] = objectGraph[descriptor.fieldName];

    return scalarAcc;
  }, {});

  const objects = objectDescriptors.reduce((objectAcc, descriptor) => {
    if (descriptor.isList) {
      objectAcc[descriptor.fieldName] = objectGraph[descriptor.fieldName].map(object => {
        return deserializeObject(object, descriptor.type, registry);
      });
    } else {
      objectAcc[descriptor.fieldName] = deserializeObject(objectGraph[descriptor.fieldName], descriptor.type, registry);
    }

    return objectAcc;
  }, {});

  const connections = connectionDescriptors.reduce((connectionsAcc, descriptor) => {
    connectionsAcc[descriptor.fieldName] = objectGraph[descriptor.fieldName].edges.map(object => {
      return deserializeObject(object.node, descriptor.type, registry);
    });

    return connectionsAcc;
  }, {});

  const model = new (registry.classForType(typeName))(scalars);

  assign(model, objects, connections);

  return model;
}
