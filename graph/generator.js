/* eslint-env node */

import path from 'path';

import dasherize from './dasherize';
import isScalar from './is-scalar';
import isObject from './is-object';
import isConnection from './is-connection';
import getBaseType from './get-base-type';
import hasListType from './has-list-type';
import fetchSchema from './fetch-schema';

function transformArgument(arg) {
  return arg.name;
}

function transformField(field) {
  return {
    type: field.baseType.name,
    kind: field.baseType.kind,
    fieldName: field.name,
    isList: hasListType(field.type),
    args: (field.args || []).map(transformArgument)
  };
}

function objectifyField(acc, field) {
  const descriptor = Object.keys(field).filter(key => {
    return (key !== 'fieldName');
  }).reduce((descriptorAcc, key) => {
    descriptorAcc[key] = field[key];

    return descriptorAcc;
  }, {});

  acc[field.fieldName] = descriptor;

  return acc;
}

function getParents(typeName, typeList) {
  return typeList.filter(potentialParent => {
    if (!potentialParent.fields) {
      return false;
    }

    return potentialParent.fields.some(field => {
      return getBaseType(field.type).name === typeName;
    });
  }).map(parent => {
    return {
      type: parent.name
    };
  });
}

function extractTypeData(types) {
  return types.filter(type => {
    return type.kind === 'OBJECT';
  }).map(type => {
    const fieldsWithBaseTypes = type.fields.map(field => {
      return Object.assign({ baseType: getBaseType(field.type) }, field);
    });

    const scalars = fieldsWithBaseTypes.filter(field => {
      return isScalar(field.baseType);
    });

    const objects = fieldsWithBaseTypes.filter(field => {
      return isObject(field.baseType) && !isConnection(field.baseType);
    });

    const connections = fieldsWithBaseTypes.filter(field => {
      return isConnection(field.baseType);
    });

    return {
      name: type.name,
      kind: type.kind,
      scalars: scalars.map(transformField).reduce(objectifyField, {}),
      objects: objects.map(transformField).reduce(objectifyField, {}),
      connections: connections.map(transformField).reduce(objectifyField, {}),
      fieldOf: getParents(type.name, types)
    };
  });
}

function typeToFile(basePath) {
  return function (type) {
    const fileName = `${path.join(basePath, dasherize(type.name))}.js`;

    return {
      path: fileName,
      name: type.name,
      body: `const ${type.name} = ${JSON.stringify(type, null, 2)};
export default ${type.name};`
    };
  };
}

function exportTypesToFiles(types) {
  const queryRoot = types.filter(type => {
    return (type.name === 'QueryRoot');
  })[0];

  const rest = types.filter(type => {
    return (type.name !== 'QueryRoot');
  });

  return rest.map(typeToFile('types')).concat(typeToFile('.')(queryRoot));
}

function exportBundle(types) {
  const moduleName = 'schema';

  const imports = types.map(type => {
    return `import ${type.name} from './${path.join(type.path).replace(/\.js$/, '')}';`;
  }).join('\n');

  const declaration = `const ${moduleName} = {}`;

  const assignments = types.map(type => {
    return `${moduleName}['${type.name}'] = ${type.name};`;
  }).join('\n');

  const body = `${imports}
${declaration}
${assignments}

export default Object.freeze(${moduleName})`;

  return types.concat({
    path: `${moduleName}.js`,
    name: moduleName,
    body
  });
}

let cachedSchema;

function cacheSchema(schema) {
  cachedSchema = schema;

  return Promise.resolve(cachedSchema);
}

function reportError(error) {
  console.error(error);

  process.exit(1);
}

export default function generateSchemaModules() {
  const processSchema = schema => {
    /* eslint-disable no-underscore-dangle */
    return extractTypeData(schema.data.__schema.types);
    /* eslint-enable no-underscore-dangle */
  };

  let schemaPromise;

  if (cachedSchema) {
    schemaPromise = Promise.resolve(cachedSchema);
  } else {
    schemaPromise = fetchSchema().then(cacheSchema);
  }

  return schemaPromise.then(processSchema).then(exportTypesToFiles).then(exportBundle).catch(reportError);
}
