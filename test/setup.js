import GraphQLJSClient from '../src/graphql-client';

function recordProfile() {
  const types = GraphQLJSClient.captureTypeProfile();
  const profile = GraphQLJSClient.captureProfile();

  if (typeof require === 'function') {
    const {writeFileSync} = require('fs');

    writeFileSync('profiled-types.json', JSON.stringify({profile: types}, null, 2));
    writeFileSync('profile.json', JSON.stringify(profile, null, 2));
  } else {
    console.log(types, profile); // eslint-disable-line no-console
  }
}

if (typeof before === 'function' && typeof after === 'function') {
  before(() => {
    if (!GraphQLJSClient.startProfiling) {
      return;
    }

    GraphQLJSClient.startProfiling();
  });

  after(() => {
    if (!GraphQLJSClient.startProfiling) {
      return;
    }

    GraphQLJSClient.pauseProfiling();
    recordProfile();
  });
}
