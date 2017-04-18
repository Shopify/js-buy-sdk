export default function normalizeId(type, id) {
  const gidProtocol = 'gid:';

  if (String(id).substr(0, gidProtocol.length) === gidProtocol) {
    return id;
  } else {
    return `${gidProtocol}//shopify/${type}/${id}`;
  }
}
