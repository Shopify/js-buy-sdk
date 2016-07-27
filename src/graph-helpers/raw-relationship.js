import graphSchema from 'graph/schema';

function formatArgPair(key, hash) {
  return `${key}: ${hash[key]}`;
}

function formatArgs(argumentHash) {
  const formattedArgs = Object.keys(argumentHash).map(key => {
    return formatArgPair(key, argumentHash);
  });

  return `(${formattedArgs.join(', ')})`;
}

export function parseArgs(args) {
  const schema = args[0];
  const relationshipKey = args[1];

  let requestArgsHash, bodyCallback;

  if (typeof args[2] === 'function') {
    bodyCallback = args[2];
  } else {
    requestArgsHash = args[2];
    bodyCallback = args[3];
  }

  return [schema, relationshipKey, requestArgsHash, bodyCallback];
}

export default function rawRelationship(/* schema, relationshipKey, requestArgsHash, bodyCallback */) {
  const [schema, relationshipKey, requestArgsHash, bodyCallback] = parseArgs(arguments);

  const relationshipModuleName = schema.relationships[relationshipKey].schemaModule;
  const relationshipSchema = graphSchema[relationshipModuleName];

  let requestArgs;
  let body;

  if (requestArgsHash) {
    requestArgs = formatArgs(requestArgsHash);
  } else {
    requestArgs = '';
  }

  if (bodyCallback) {
    body = `{ ${bodyCallback(relationshipSchema)} }`;
  } else {
    body = '';
  }

  return [relationshipKey, requestArgs, body].join(' ').trim();
}
