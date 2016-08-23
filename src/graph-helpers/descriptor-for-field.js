import rawDescriptorForField from './raw-descriptor-for-field';

export default function descriptorForField(/* field, typeModuleName */) {
  const rawDescriptor = rawDescriptorForField(...arguments);

  if (rawDescriptor.name.match(/Connection$/)) {
    const edgeDescriptor = rawDescriptorForField('edges', rawDescriptor.type.moduleName);
    const nodeDescriptor = rawDescriptorForField('node', edgeDescriptor.type.moduleName);

    return {
      name: nodeDescriptor.name,
      isList: edgeDescriptor.isList,
      type: nodeDescriptor.type
    };
  }

  return rawDescriptor;
}
