/* eslint-env node */

import path from 'path';

import dasherize from './dasherize';
import isBuiltin from './is-builtin';
import getBaseType from './get-base-type';
import hasListType from './has-list-type';
import fetchSchema from './fetch-schema';

function transformArgument(arg) {
  return arg.name;
}

function transformField(field) {
  return {
    fieldName: field.name,
    isList: hasListType(field.type)
  };
}

function objectifyField(acc, field) {
  const descriptor = {};

  Object.keys(field).filter(key => {
    return (key !== 'fieldName');
  }).forEach(key => {
    descriptor[key] = field[key];
  });

  acc[field.fieldName] = descriptor;

  return acc;
}

function transformFieldWithArgs(field) {
  return {
    fieldName: field.name,
    isList: hasListType(field.type),
    args: field.args.map(transformArgument)
  };
}

function transformRelationship(field) {
  let args;

  if (field.args) {
    args = field.args.map(transformArgument);
  } else {
    args = [];
  }

  const type = getBaseType(field.type);
  const isList = hasListType(field.type);

  const relationship = {
    fieldName: field.name,
    isList,
    type,
    args
  };

  return relationship;
}

function getParents(typeName, typeList) {
  return typeList.filter(potentialParent => {
    if (!potentialParent.fields) {
      return false;
    }

    return (potentialParent.fields.filter(field => {
      return getBaseType(field.type) === typeName;
    }).length > 0);
  }).map(parent => {
    return {
      type: parent.name
    };
  });
}

function jsonSanitizer(key, value) {
  if (key === 'isBuiltin') {
    /* eslint-disable no-undefined */
    return undefined;
    /* eslint-enable no-undefined */
  }

  return value;
}

function extractTypeData(types) {
  return types.map(type => {
    const allFields = type.fields || [];

    const fields = allFields.filter(field => {
      return (isBuiltin(getBaseType(field.type)) && field.args.length === 0);
    });

    const fieldsWithArgs = allFields.filter(field => {
      return (isBuiltin(getBaseType(field.type)) && field.args.length < 0);
    });

    const relationships = allFields.filter(field => {
      return !isBuiltin(getBaseType(field.type));
    });

    return {
      name: type.name,
      isBuiltin: isBuiltin(type.name),
      fields: fields.map(transformField).reduce(objectifyField, {}),
      fieldsWithArgs: fieldsWithArgs.map(transformFieldWithArgs).reduce(objectifyField, {}),
      relationships: relationships.map(transformRelationship).reduce(objectifyField, {}),
      fieldOf: getParents(type.name, types)
    };
  });
}

function rejectBuiltins(type) {
  return !type.isBuiltin;
}

function typeToFile(basePath) {
  return function (type) {
    const fileName = `${path.join(basePath, dasherize(type.name))}.js`;

    return {
      path: fileName,
      name: type.name,
      body: `const ${type.name} = ${JSON.stringify(type, jsonSanitizer, 2)};
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
    return extractTypeData(schema.data.__schema.types).filter(rejectBuiltins);
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
