import rawTypeForField from './raw-type-for-field';

export default function typeForField(/* field, typeModuleName */) {
  const rawType = rawTypeForField(...arguments);

  if (rawType.name.match(/Connection$/)) {
    const edgeType = rawTypeForField('edges', rawType.moduleName);
    const nodeType = rawTypeForField('node', edgeType.moduleName);

    return Object.assign(nodeType, { isList: edgeType.isList });
  }

  return rawType;
}
