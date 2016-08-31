import rawDescriptorForField from './raw-descriptor-for-field';

export default function descriptorForField(fieldName/* , typeModuleName */) {
  const rawDescriptor = rawDescriptorForField(...arguments);

  if (rawDescriptor.typeName.match(/Connection$/)) {

    const edgeDescriptor = rawDescriptorForField('edges', rawDescriptor.typeName);
    const nodeDescriptor = rawDescriptorForField('node', edgeDescriptor.typeName);

    return {
      fieldName,
      typeName: nodeDescriptor.typeName,
      isList: edgeDescriptor.isList,
      type: nodeDescriptor.type,
      isPaginated: true
    };
  }

  return rawDescriptor;
}
