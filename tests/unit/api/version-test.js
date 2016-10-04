/* eslint no-new: 0 */

import { module, test } from 'qunit';
import version from 'shopify-buy/version';

module('Unit | Version');

test('it exists', function (assert) {
  assert.expect(2);

  assert.equal(typeof version, 'string');
  assert.ok(version.match(/v\d\.\d\.\d-([a-f0-9]{6}|no commit)/), `a version string of the format vX.Y.Z-abc123 exists. Found ${version}`);
});
