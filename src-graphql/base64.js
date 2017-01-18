export default function base64(str) {
  if (typeof btoa === 'function') {
    return btoa(str);
  } else {
    return Buffer.from(str).toString('base64');
  }
}
