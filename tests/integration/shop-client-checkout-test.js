import { module, test } from 'qunit';
import { step, resetStep } from 'buy-button-sdk/tests/helpers/assert-step';
import ShopClient from 'buy-button-sdk/shop-client';
import Config from 'buy-button-sdk/config';
import Pretender from 'pretender';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 1,
  channelId: 'abc123'
};


const config = new Config(configAttrs);

const baseUrl = `https://${configAttrs.myShopifyDomain}.myshopify.com/anywhere`;

function apiUrl(path) {
  return `${baseUrl}${path}`;
}

const checkoutFixture = {
  checkout: {
    created_at: '2015-09-02T14:55:07-04:00',
    currency: 'USD',
    customer_id: null,
    email: 'me@example.com',
    location_id: null,
    order_id: null,
    requires_shipping: false,
    reservation_time: 300,
    source_name: '755357713',
    source_identifier: null,
    source_url: null,
    taxes_included: false,
    token: '1d0a57465415832f034642f8d83fd551',
    updated_at: '2015-09-02T14:55:07-04:00',
    payment_due: '0.00',
    payment_url: 'https://app.local/cardserver/sessions',
    reservation_time_left: 0,
    subtotal_price: '0.00',
    total_price: '0.00',
    total_tax: '0.00',
    order_status_url: null,
    privacy_policy_url: null,
    refund_policy_url: null,
    terms_of_service_url: null,
    web_url: 'https://checkout.local/690933842/checkouts/1d0a57465415832f034642f8d83fd551',
    tax_lines: [],
    line_items: [],
    gift_cards: [],
    shipping_rate: null,
    shipping_address: null,
    credit_card: null,
    billing_address: null,
    discount: null
  }
};

let shopClient;
let pretender;

module('Integration | ShopClient - checkouts', {
  setup() {
    shopClient = new ShopClient(config);
    pretender = new Pretender();
    resetStep();
  },
  teardown() {
    shopClient = null;
    pretender.shutdown();
  }
});

test('it resolves with a new checkout on ShopClient#create', function (assert) {
  assert.expect(2);

  const done = assert.async();

  pretender.post(apiUrl('/checkouts.json'), function () {
    return [200, {}, JSON.stringify(checkoutFixture)];
  });

  shopClient.create('checkouts').then(checkout => {
    assert.deepEqual(checkout.attrs, checkoutFixture.checkout);
    assert.equal(checkout.shopClient, shopClient);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with an existing checkout on ShopClient#fetch', function (assert) {
  assert.expect(2);

  const done = assert.async();

  const token = 'abc123';

  pretender.get(apiUrl(`/checkouts/${token}.json`), function () {
    return [200, {}, JSON.stringify(checkoutFixture)];
  });

  shopClient.fetch('checkouts', token).then(checkout => {
    assert.deepEqual(checkout.attrs, checkoutFixture.checkout);
    assert.equal(checkout.shopClient, shopClient);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with a new modified checkout on ShopClient#update', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const token = checkoutFixture.checkout.token;
  const lineItem = {
    quantity: 1,
    id: 12345
  };

  pretender.get(apiUrl(`/checkouts/${token}.json`), function () {
    step(1, 'runs a fetch', assert);

    return [200, {}, JSON.stringify(checkoutFixture)];
  });

  pretender.patch(apiUrl(`/checkouts/${token}.json`), function (request) {
    step(3, 'runs an update', assert);

    const payload = JSON.parse(request.requestBody);

    assert.deepEqual(payload.checkout.line_items[0], lineItem);

    return [200, {}, JSON.stringify(payload)];
  });

  shopClient.fetch('checkouts', token).then(checkout => {
    step(2, 'resolves with a model', assert);

    checkout.attrs.line_items = [lineItem];

    shopClient.update('checkouts', checkout).then(updatedCheckout => {
      step(4, 'resolves with the updated line items', assert);
      assert.deepEqual(updatedCheckout.attrs.line_items[0], lineItem);
      done();
    }).catch(() => {
      assert.ok(false, '#2 promise should not reject');
      done();
    });
  }).catch(() => {
    assert.ok(false, '#1 promise should not reject');
    done();
  });
});
