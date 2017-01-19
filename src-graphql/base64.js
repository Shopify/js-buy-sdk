export default function base64(str) {
  if (typeof btoa === 'function') {
    return btoa(str);
  } else if (typeof Buffer !== 'undefined') { // eslint-disable-line no-negated-condition
    return Buffer.from(str).toString('base64');
  } else {
    throw new Error('No native way to base64 encode');
  }
}
