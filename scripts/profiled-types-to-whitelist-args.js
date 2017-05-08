const types = require('../profiled-types.json').profile;

process.stdout.write(types.join(','));
