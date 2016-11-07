import GUID_KEY from 'shopify-buy/metal/guid-key';

export const cartFixture = {
  cart: {
    created_at: '2016-03-09T10:52:51-05:00',
    currency: 'CAD',
    customer_id: null,
    email: '',
    location_id: null,
    order_id: null,
    requires_shipping: true,
    reservation_time: 300,
    source_name: '1233860',
    source_identifier: null,
    source_url: null,
    taxes_included: false,
    updated_at: '2016-03-09T10:52:51-05:00',
    payment_due: '4.04',
    payment_url: 'https://elb.deposit.shopifycs.com/sessions',
    reservation_time_left: 299,
    subtotal_price: '4.04',
    total_price: '4.04',
    total_tax: '0.00',
    attributes: [],
    note: '',
    order: null,
    order_status_url: null,
    privacy_policy_url: null,
    refund_policy_url: null,
    terms_of_service_url: null,
    user_id: null,
    web_url: 'https://cart.shopify.com/10901932/carts/2fadcb49fad5087fd0ff225717ccd743',
    tax_lines: [],
    line_items: [
      {
        id: '2675eb742f923a92',
        product_id: 3677189889,
        variant_id: 10738392513,
        sku: '',
        vendor: 'buckets-o-stuff',
        title: 'Aluminum Pole',
        variant_title: 'Short / Tons',
        taxable: true,
        requires_shipping: true,
        price: '4.04',
        compare_at_price: null,
        line_price: '4.04',
        properties: {},
        quantity: 1,
        grams: 1000,
        fulfillment_service: 'manual',
        applied_discounts: []
      }
    ],
    gift_cards: [],
    shipping_rate: null,
    shipping_address: null,
    credit_card: null,
    billing_address: null,
    discount: null
  }
};
cartFixture.cart.line_items.forEach((item, index) => {
  item[GUID_KEY] = index;
});

cartFixture.cart[GUID_KEY] = 'abc123';
