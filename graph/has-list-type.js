export default function hasListType(typeDescriptor) {
  if (typeDescriptor.kind === 'LIST') {
    return true;
  } else if (typeDescriptor.ofType) {
    return hasListType(typeDescriptor.ofType);
  }

  return false;
}
