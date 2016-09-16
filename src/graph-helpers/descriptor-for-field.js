import rawDescriptorForField from './raw-descriptor-for-field';

export default function descriptorForField(fieldName/* , typeModuleName */) {
  const rawDescriptor = rawDescriptorForField(...arguments);

  if (rawDescriptor.type.match(/Connection$/)) {

    const edgeDescriptor = rawDescriptorForField('edges', rawDescriptor.type);
    const nodeDescriptor = rawDescriptorForField('node', edgeDescriptor.type);

    return {
      fieldName,
      schema: nodeDescriptor.schema,
      type: nodeDescriptor.type,
      isList: edgeDescriptor.isList,
      isConnection: true
    };
  }

  return rawDescriptor;
}
