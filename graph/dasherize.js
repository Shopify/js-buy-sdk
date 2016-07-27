export default function dasherize(string) {
  return string.replace(/([A-Z]{1})([^A-Z])/g, '-$1$2')
               .replace(/^-/, '')
               .toLowerCase();
}
