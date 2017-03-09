export default function base64Encode(string) {
  if (typeof btoa === 'function') {
    return btoa(string);
  } else if (typeof Buffer === 'function') {
    return Buffer.from(string).toString('base64');
  } else {
    throw new Error('No native way to base64 encode');
  }
}
