import assert from 'assert';
import Config from '../src-graphql/config';


suite('config-test', () => {
  test('it throws an error on no params', () => {
    assert.throws(() => {
      new Config({}); // eslint-disable-line no-new
    });
  });

  test('it throws an error with some but not all params', () => {
    assert.throws(() => {
      new Config({storefrontAccessToken: 123}); // eslint-disable-line no-new
    });
  });

  test('it doesn\'t throw when all required params are specified', () => {
    assert.doesNotThrow(() => {
      new Config({ // eslint-disable-line no-new
        domain: 'krundle.com',
        storefrontAccessToken: 123
      });
    });
  });

  test('it should have accessible values', () => {
    const domain = 'krundle.com';
    const storefrontAccessToken = 123;

    const config = new Config({
      domain,
      storefrontAccessToken
    });

    assert.equal(config.domain, domain, 'domain should match');
    assert.equal(config.storefrontAccessToken, storefrontAccessToken, 'storefrontAccessToken should match');
  });
});
