const tinylr = require('tiny-lr');
const port = require('../package.json').livereloadPort;

tinylr().listen(port, () => {
  console.log(`Livereload listening on ${port}`);
});
