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
yarn add shopify-buy@alpha
```
**With NPM:**

Remove the old version, then
```bash
npm install shopify-buy@alpha
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

1.  The v1 functions take in a `Storefront ID` for fetching a product or collection by ID. A `Storefront ID` can be found under
    the `API details` section on product and collection pages in the Shopify admin. 
    `API details` will only be displayed if you have a private app with Storefront API access. For more details see the 
    [Getting Started Guide](https://help.shopify.com/api/storefront-api/getting-started#authentication) for the Storefront API.

2.  The functions now take an additional optional `query` argument that specifies the fields to query on the resource.
    ```js
    const query = productNodeQuery(['title', ['images', imageConnectionQuery()]];

    client.fetchProduct('Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzk4OTUzMTMwMjc=', query).then((product) => {
      console.log(product); // Product with only title and images
    });
    ```
    Fields and queries can be nested like so:
    ```js
    // Product query with title and variants, where variants have price and title
    const query = productNodeQuery(['title', ['variants', variantConnectionQuery(['price', 'title'])]]);
    ```
    If the `query` argument isn't supplied, a default list of arguments will be used.
    See the [API reference](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/docs/API_REFERENCE.md#Client.Queries) for more details.

3.  `fetchCollection()` and `fetchAllCollections()` no longer return the products in the collections by default.
    To fetch products on the collections, use `fetchCollectionWithProducts()` and `fetchAllCollectionsWithProducts()`,
    or specify products in the query function parameter.
    ```js
    const collectionId = 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzI1NzY5NzczMQ=='
    
    // Use the built-in function
    client.fetchCollectionWithProducts(collectionId).then((collection) => {
      console.log(collection); // Collection with all default fields and products with all default fields.
    });

    // or specify a custom query
    const query = collectionNodeQuery(['title', ['products', productConnectionQuery(['title'])]]);

    client.fetchCollection(collectionId, query).then((collection) => {
      console.log(collection); // Collection with only title and products with only title
    });
    ```
    Note that `fetchCollectionWithProducts()` and `fetchCollectionsWithProducts()` do not take a `query` argument.

4.  `fetchQueryProducts()` and `fetchQueryCollections()` query different fields and take an optional `query` argument.
    See the [API reference](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/docs/API_REFERENCE.md) for more details.

### Carts/Checkouts

Carts are replaced with checkouts. Like the fetch functions, all checkout functions take an optional `query` argument that specifies fields to return on the checkout.

`fetchRecentCart()`, `updateModel()`, and `clearLineItems()` have been removed. `checkoutUrl` has been renamed to `webUrl`.

#### Creating a Checkout

To create a checkout, use `createCheckout()`.

**v0.7:**
```js
client.createCart().then((cart) => {
  console.log(cart); // Empty cart
});
```

**v1:**
```js
client.createCheckout().then((checkout) => {
  console.log(checkout); // Empty checkout
});
```
The checkout can also be initialized with fields like line items and a shipping address. See the [API reference](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/docs/API_REFERENCE.md#Client+createCheckout) for more details. 

#### Fetching a Checkout

To fetch a checkout, use `fetchCheckout()`.

**v0.7:**
```js
client.fetchRecentCart().then((cart) => {
  console.log(cart); // Most recently created cart
});

// or
client.fetchCart('shopify-buy.1459804699118.2').then(cart => {
  console.log(cart); // The retrieved cart
});
```

**v1:**
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI=';

client.fetchCheckout(checkoutId).then((checkout) => {
  console.log(checkout); // The retrieved checkout
});
```
#### Modifying an Existing Checkout

The functions to modify a checkout are on `Client` rather than `CartModel`.

##### Adding Line Items

To add line items to a checkout, use `addLineItems()` (previously `createLineItemsFromVariants()`).

**v0.7:**
```js
cart.createLineItemsFromVariants({variant: variantObject1, quantity: 5}, {variant: variantObject2, quantity: 2}).then((cart) => {
  console.log(cart); // Cart with two additional line items
});
```

**v1:**
```js
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI=';
const lineItems = [
  {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yNTYwMjIzNTk3Ng==', quantity: 5},
  {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yNTYwMjIzNjA0MA==', quantity: 2}
];

client.addLineItems(checkoutId, lineItems).then((checkout) => {
  console.log(checkout); // Checkout with two additional line items
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
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI=';
const lineItemId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=';
const lineItems = [
  {id: lineItemId, quantity: 1}
];

client.updateLineItems(checkoutId, lineItems).then((checkout) => {
  console.log(checkout); // Checkout with a line item quantity updated to 1
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
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI=';
const lineItemIds = [
  'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ='
];

client.removeLineItems(checkoutId, lineItemIds).then((checkout) => {
  console.log(checkout); // Checkout with a line item removed
});
```
