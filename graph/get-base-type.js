export default function getBaseType(typeDescriptor) {
  if (typeDescriptor.ofType) {
    return getBaseType(typeDescriptor.ofType);
  }

  return typeDescriptor.name;
}
