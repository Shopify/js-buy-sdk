import assert from 'assert';
import {fixtureWithHeaders} from '../fetch-mock-helper';

// fixtures
import shopInfoFixture from '../../fixtures/shop-info-fixture';

suite('fetch-mock-helper-test', () => {
  test('it wraps the fixture with headers and a body', () => {
    const shopInfoFixtureWithHeaders = fixtureWithHeaders(shopInfoFixture);

    assert.equal(shopInfoFixtureWithHeaders.headers['Content-Type'], 'application/json');
    assert.equal(shopInfoFixtureWithHeaders.body, shopInfoFixture);
  });
});
