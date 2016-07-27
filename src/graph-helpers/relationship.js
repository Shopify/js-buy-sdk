import relationship from './raw-relationship';
import { parseArgs } from './raw-relationship';
import fields from './fields';
import join from './join';

function wrapCallback(callbackFunction) {
  return function (schema) {
    if (schema.name.match(/Connection$/)) {
      const pageInfo = relationship(schema, 'pageInfo', pageInfoSchema => {
        return fields(pageInfoSchema);
      });
      const edge = relationship(schema, 'edges', edgeSchema => {
        const edgeFields = fields(edgeSchema);
        const node = relationship(edgeSchema, 'node', nodeSchema => {
          return callbackFunction(nodeSchema);
        });

        return join(edgeFields, node);
      });

      return join(pageInfo, edge);
    }

    return callbackFunction(...arguments);
  };
}

export default function connectionAwareRelationship(/* schema, relationshipKey, requestArgsHash, bodyCallback */) {
  const [schema, relationshipKey, requestArgsHash, bodyCallback] = parseArgs(arguments);
  let wrappedCallback;

  if (bodyCallback) {
    wrappedCallback = wrapCallback(bodyCallback);
  } else {
    wrappedCallback = bodyCallback;
  }

  return relationship(schema, relationshipKey, requestArgsHash, wrappedCallback);
}
