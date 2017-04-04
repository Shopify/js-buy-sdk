import GraphQLJSClient from 'graphql-js-client/dev';

function recordTypes() {
  const types = GraphQLJSClient.trackedTypes();

  if (typeof require === 'function') {
    const body = JSON.stringify({'profiled-types': types}, null, '  ');

    require('fs').writeFileSync('profiled-types.json', body);
  } else {
    console.log(types); // eslint-disable-line no-console
  }
}

before(() => {
  GraphQLJSClient.startTracking();
});

after(() => {
  GraphQLJSClient.pauseTracking();
  recordTypes();
});
