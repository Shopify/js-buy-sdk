import GraphQLJSClient from '../src/graphql-client';

function recordTypes() {
  const types = GraphQLJSClient.trackedTypes();

  if (typeof require === 'function') {
    const body = JSON.stringify({'profiled-types': types}, null, 2);

    require('fs').writeFileSync('profiled-types.json', body);
  } else {
    console.log(types); // eslint-disable-line no-console
  }
}

if (typeof before === 'function' && typeof after === 'function') {
  before(() => {
    if (!GraphQLJSClient.startTracking) {
      return;
    }

    GraphQLJSClient.startTracking();
  });

  after(() => {
    if (!GraphQLJSClient.startTracking) {
      return;
    }

    GraphQLJSClient.pauseTracking();
    recordTypes();
  });
}
