import { module, test } from 'qunit';
import ReferenceSerializer from 'shopify-buy/serializers/reference-serializer';
import ReferenceModel from 'shopify-buy/models/reference-model';

let serializer;

const config = {};

module('Unit | ReferenceSerializer', {
  setup() {
    serializer = new ReferenceSerializer(config);
  },
  teardown() {
    serializer = null;
  }
});


const referenceFixture = {
  referenceId: 'some-reference'
};

test('it returns ReferenceModel for reference type', function (assert) {
  assert.expect(1);

  assert.equal(serializer.modelForType('references'), ReferenceModel);
});

test('it transforms a single item payload into a reference object.', function (assert) {
  assert.expect(2);

  const model = serializer.deserializeSingle('references', referenceFixture);

  assert.notOk(Array.isArray(model), 'should not be an array');
  assert.deepEqual(model.attrs, referenceFixture);
});

test('it attaches a reference of the passed serializer to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const model = serializer.deserializeSingle('references', referenceFixture, { serializer });

  assert.deepEqual(model.serializer, serializer);
});

test('it attaches a reference of the passed shopClient to the model on #deserializeSingle', function (assert) {
  assert.expect(1);

  const shopClient = 'some-shop-client';

  const model = serializer.deserializeSingle('references', referenceFixture, { shopClient });

  assert.equal(model.shopClient, shopClient);
});

test('it transforms a model into a payload on #serialize using the root key', function (assert) {
  const model = new ReferenceModel(referenceFixture);

  const payload = serializer.serialize('references', model);

  assert.deepEqual(payload, model.attrs);
});

test('it attaches a reference to the config', function (assert) {
  assert.expect(1);

  const model = serializer.deserializeSingle('references', referenceFixture, { config });

  assert.equal(model.config, config);
});
