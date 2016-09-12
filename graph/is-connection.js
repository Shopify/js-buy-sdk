export default function isConnection(typeDescriptor) {
  return Boolean(typeDescriptor.name.match(/.+Connection$/));
}
