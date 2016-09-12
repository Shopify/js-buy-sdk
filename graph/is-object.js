export default function isScalar(typeDescriptor) {
  return typeDescriptor.kind === 'OBJECT';
}
