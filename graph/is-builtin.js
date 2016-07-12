const builtins = [
  'Boolean',
  'DateTime',
  'ID',
  'Int',
  'Money',
  'Node',
  'PageInfo',
  'String',
  'URL'
];

export default function isBuiltin(name) {
  return Boolean((builtins.indexOf(name) >= 0) || name.match(/^__/));
}
