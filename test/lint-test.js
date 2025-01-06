import 'lint-tests'; // eslint-disable-line

import assert from 'assert';
import Client from '../src/client';

suite('manual-lint-test', () => {
  const config = {
    domain: 'graphql.myshopify.com',
    storefrontAccessToken: '595005d0c565f6969eece280de85edb5'
  };

  test('it has pageInfo on all relay connection types', () => {
    const client = Client.buildClient(config);
    const objectTypes = client.graphQLClient.typeBundle.types;

    Object.keys(objectTypes)
      .filter((key) => key.includes('Connection'))
      .forEach((key) => {
        assert.equal(objectTypes[key].fieldBaseTypes.pageInfo, 'PageInfo');
      });
  });
});
