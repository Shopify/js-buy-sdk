**NOTE:** This is currently outdated and reflects the alpha branch. Method names are currently in flux on the beta branch.
# Migration Guide

This document provides a set of guidelines for migrating from v0.7 of the JS Buy SDK to v1 of the JS Buy SDK
which uses Shopify's GraphQL-based [Storefront API](https://help.shopify.com/api/storefront-api/reference).

## Table of Contents

- [Installation](#installation)
- [Updated Functions and Classes](#updated-functions-and-classes)
  + [Initialization](#initialization)
  + [Fetching Products and Collections](#fetching-products-and-collections)
  + [Carts/Checkouts](#cartscheckouts)

## Installation

**With Yarn:**

```bash
yarn add shopify-buy@beta
```
**With NPM:**

Remove the old version, then
```bash
npm install shopify-buy@beta
```

## Updated Functions and Classes

### Initialization

Rather than using a static function to create the client (`ShopifyBuy.buildClient()`), v1 exposes the `Client`
(previously `ShopClient`) and a `Config` class for the `Client` directly. An instance of `Client` can be created like so:
```js
import Client, {Config} from 'shopify-buy';

const config = new Config({
  domain: 'your-shop-name.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token'
});

const client = new Client(config);
```

### Fetching Products and Collections

The functions for fetching products and collections are mostly the same. Major differences are:

1. The v1 functions take in a `Storefront ID` for fetching a product or collection by ID. A `Storefront ID` can be found under
[the retrieving IDs section](https://help.shopify.com/api/storefront-api/getting-started#retrieving-ids) of the Storefront API docs.
`API details` will only be displayed if you have a private app with Storefront API access. For more details see the 
[Getting Started Guide](https://help.shopify.com/api/storefront-api/getting-started#authentication) for the Storefront API.

2. Collections can be fetched with products using `collection.fetchWithProducts()` and `collection.fetchAllWithProducts()`.
```js
const collectionId = 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzI1NzY5NzczMQ=='

// Use the built-in function
client.collection.fetchWithProducts(collectionId).then((collection) => {
  console.log(collection); // Collection with all default fields and products with all default fields.
  console.log(collection.products); // Products on the collection
});
```

3. `product.fetchQuery()` and `collection.fetchQuery()` query different fields and take an optional `query` argument.
See the [product connection field](https://help.shopify.com/api/storefront-api/reference/object/shop#products) and
[collection connection field](https://help.shopify.com/api/storefront-api/reference/object/shop#collections) docs
in the storefront API for more details.

**v0.7:**
```js
client.fetchQueryProducts({collection_id: '336903494', tag: ['hats']}).then((products) => {
  console.log(products); // An array of products in collection '336903494' having the tag 'hats'
});
```

**v1:**
```js
const query = {
  query: 'updated_at:>="2016-09-25T21:31:33"',
  sortBy: 'title'
};

client.products.fetchQuery(query).then((products) => {
  console.log(products); // An array of products updated after 2016-09-25T21:31:33 
                         // and sorted in ascending order by title.
});
```

### Carts/Checkouts

Carts are replaced with checkouts. Like the fetch functions, all checkout functions take an optional `query` argument that specifies fields to return on the checkout.

`fetchRecentCart()`, `updateModel()`, and `clearLineItems()` have been removed. `checkoutUrl` has been renamed to `webUrl`.

#### Creating a Checkout

To create a checkout, use `checkout.create()`. You are responsible for capturing the ID of the checkout for later usage. If you would like to persist the checkout between sessions, store the ID in a cookie or localStorage.

**v0.7:**
```js
client.createCart().then((cart) => {
  console.log(cart); // Empty cart
});
```

**v1:**
```js
client.checkout.create().then((checkout) => {
  console.log(checkout); // Empty checkout
  console.log(checkout.id); // The ID of the checkout. Store this for later usage.
});
```
The checkout can also be initialized with fields like line items and a shipping address. See the [API reference(update me)](https://github.com/Shopify/js-buy-sdk/blob/v1.0beta/docs/API_REFERENCE.md#Client+createCheckout) for more details.

#### Fetching a Checkout

To fetch a checkout, use `fetchCheckout()`.

**v0.7:**
```js
client.fetchRecentCart().then((cart) => {
  console.log(cart); // Most recently created cart
});
```

**v1:**
```js
client.checkout.create().then((checkout) => {
  localStorage.setItem('checkoutId', checkout.id); // Store the ID in localStorage
});

// In another session:
const checkoutId = localStorage.getItem('checkoutId');

client.checkout.fetch(checkoutId).then((checkout) => {
  console.log(checkout); // The retrieved checkout
});
```

**v0.7:**
```js
client.fetchCart('shopify-buy.1459804699118.2').then(cart => {
  console.log(cart); // The retrieved cart
});
```

**v1:**
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID from a previous checkout.create call

client.checkout.fetch(checkoutId).then((checkout) => {
  console.log(checkout); // The retrieved checkout
});
```
#### Modifying an Existing Checkout

The functions to modify a checkout are on `Client` rather than `CartModel`.

##### Adding Line Items

To add line items to a checkout, use `addLineItems()` (previously `createLineItemsFromVariants()`). Similar to the checkout's ID, you are responsible for storing line item IDs for updates and removals.

**v0.7:**
```js
cart.createLineItemsFromVariants({variant: variantObject1, quantity: 5}, {variant: variantObject2, quantity: 2}).then((cart) => {
  console.log(cart); // Cart with two additional line items
});
```

**v1:**
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID from a previous checkout.create call
const lineItems = [
  {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yNTYwMjIzNTk3Ng==', quantity: 5},
  // Line items can also have additional custom attributes
  {
    variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yNTYwMjIzNjA0MA==',
    quantity: 2, 
    customAttributes: {'key': 'attributeKey', 'value': 'attributeValue'}
  }
];

client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
  console.log(checkout); // Checkout with two additional line items
  console.log(checkout.lineItems) // Line items on the checkout
});
```

##### Updating Line Items

To update line items on a checkout, use `updateLineItems()`.

**v0.7:**
```js
const lineItemId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=';
const quantity = 1;

cart.updateLineItem(lineItemId, quantity).then((cart) => {
  console.log(cart); // Cart with a line item quantity updated to 1
});
```

**v1:**
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID from a previous checkout.create call
const lineItemId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=';
const lineItems = [
  {id: lineItemId, quantity: 1}
];

client.checkout.updateLineItems(checkoutId, lineItems).then((checkout) => {
  console.log(checkout); // Checkout with a line item quantity updated to 1
  console.log(checkout.lineItems) // Line items on the checkout
});
```

##### Removing Line Items
To remove line items on a checkout, use `removeLineItems()`.

**v0.7:**
```js
const lineItemId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=';

cart.removeLineItem(lineItemId).then((cart) => {
  console.log(cart); // Cart with a line item removed
});
```

**v1:**
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID from a previous checkout.create call
const lineItemIds = [
  'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ='
];

client.checkout.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
  console.log(checkout); // Checkout with a line item removed
  console.log(checkout.lineItems) // Line items on the checkout
});
```
