const types = require('../profiled-types.json')['profiled-types'];

const args = types.map((type) => {
  return `--whitelist-type ${type}`;
}).join(' ');

process.stdout.write(args);
