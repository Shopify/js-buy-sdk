const types = require('../profiled-types.json')['profiled-types'];

process.stdout.write(types.join(','));
