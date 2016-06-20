/* global require, describe, beforeEach, it, browser */

const assert = require('assert');

describe('it loads', function () {

  beforeEach(function () {
    browser.url('http://localhost:4200/examples/cart');
    browser.waitForText('.product-title', '6 Panel – Aztec');
  });

  it('should have the right title', function () {
    assert.equal(browser.getTitle(), 'JS Buy SDK Example -- Cart 001');
  });

  it('it should render a product', function () {
    assert.equal(browser.getAttribute('.variant-image', 'src'), 'https://cdn.shopify.com/s/files/1/1019/0495/products/i5.jpg?v=1446943528');
    assert.equal(browser.getText('.variant-title'), 'Black');
    assert.equal(browser.getText('.variant-price'), '$32.00');
    assert.equal(browser.getValue('select[name=Color]'), 'Black');
  });
});

describe('it behaves', function () {

  beforeEach(function () {
    browser.url('http://localhost:4200/examples/cart');
    browser.waitForText('.product-title', '6 Panel – Aztec');
  });

  it('updates the variant by changing the select value', function () {
    assert.equal(browser.getAttribute('.variant-image', 'src'), 'https://cdn.shopify.com/s/files/1/1019/0495/products/i5.jpg?v=1446943528');
    assert.equal(browser.getText('.variant-title'), 'Black');
    assert.equal(browser.getValue('select[name=Color]'), 'Black');

    browser.selectByVisibleText('select[name=Color]', 'Red');

    assert.equal(browser.getAttribute('.variant-image', 'src'), 'https://cdn.shopify.com/s/files/1/1019/0495/products/i6.jpg?v=1446943530');
    assert.equal(browser.getText('.variant-title'), 'Red');
    assert.equal(browser.getValue('select[name=Color]'), 'Red');
  });

  it('adds an item to the cart by clicking add to cart', function () {
    browser.click('.buy-button');

    assert.equal(browser.getText('.cart-item__title'), '6 Panel – Aztec');
    assert.equal(browser.getText('.cart-item__variant-title'), 'Black');
  });

  it('takes us to checkout', function () {
    browser.click('.buy-button');
    browser.click('#checkout');

    assert.equal(browser.getTitle(), 'Embeds - Checkout');
  });
});
