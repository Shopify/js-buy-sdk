import 'lint-tests'; // eslint-disable-line

import assert from 'assert';
import Client from '../src/client';

suite('manual-lint-test', () => {
  const config = {
    domain: 'sendmecats.myshopify.com',
    storefrontAccessToken: 'abc123'
  };

  test('it ensures that all Connections include pageInfo', () => {
    const client = Client.buildClient(config);
    const objectTypes = client.graphQLClient.typeBundle.types;

    for (const key in objectTypes) {
      if (objectTypes.hasOwnProperty(key) && key.includes('Connection')) {
        assert.equal(objectTypes[key].fieldBaseTypes.pageInfo, 'PageInfo');
      }
    }
  });
});
