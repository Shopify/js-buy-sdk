# [Shopify](https://www.shopify.com) JavaScript Buy SDK
[![Circle CI](https://circleci.com/gh/Shopify/js-buy-sdk/tree/master.png?circle-token=3be0ebe6fbb4841442b86678696947bd4b5456d7)](https://circleci.com/gh/Shopify/js-buy-sdk/tree/master)

**Note**: For help with migrating from v0 of JS Buy SDK to v1 check out the
[Migration Guide](https://github.com/Shopify/js-buy-sdk/blob/master/tutorials/MIGRATION_GUIDE.md).

The JS Buy SDK is a lightweight library that allows you to build ecommerce into
any website. It's based on Shopify's [Storefront API](https://help.shopify.com/api/storefront-api/getting-started)
and provides the ability to retrieve products and collections from your shop, add products to a cart, and checkout.

[Full API docs are available here](https://shopify.github.io/js-buy-sdk).

## Table Of Contents

- [Installation](#installation)
- [Builds](#builds)
- [Examples](#examples)
  + [Initializing the Client](#initializing-the-client)
  + [Fetching Products](#fetching-products)
  + [Fetching Collections](#fetching-collections)
  + [Creating a Checkout](#creating-a-checkout)
  + [Adding Line Items](#adding-line-items)
  + [Updating Line Items](#updating-line-items)
  + [Removing Line Items](#removing-line-items)
  + [Fetching a Checkout](#fetching-a-checkout)
- [Example Apps](#example-apps)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Installation
**With Yarn:**
```bash
$ yarn add shopify-buy
```
**With NPM:**
```bash
$ npm install shopify-buy
```

**CDN:**

There is a minified UMD build available via CDN:

```html
<script src="http://sdks.shopifycdn.com/js-buy-sdk/v1/latest/index.umd.min.js"></script>
```

## Builds
The JS Buy SDK has four build versions: ES, CommonJS, AMD, and UMD.

**ES, CommonJS:**
```javascript
import Client from 'shopify-buy';
```
**AMD:**
```javascript
import Client from 'shopify-buy/index.amd';
```
**UMD:**
```javascript
import Client from 'shopify-buy/index.umd';
```

## Examples

### Initializing the Client
```javascript
import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: 'your-shop-name.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token'
});
```

### Fetching Products
```javascript
// Fetch all products in your shop
client.product.fetchAll().then((products) => {
  // Do something with the products
  console.log(products);
});

// Fetch a single product by ID
const productId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=';

client.product.fetch(productId).then((product) => {
  // Do something with the product
  console.log(product);
});
```

### Fetching Collections
```javascript
// Fetch all collections, including their products
client.collection.fetchAllWithProducts().then((collections) => {
  // Do something with the collections
  console.log(collections);
  console.log(collections[0].products);
});

// Fetch a single collection by ID, including its products
const collectionId = 'Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzM2OTMxMjU4NA==';

client.collection.fetchWithProducts(collectionId).then((collection) => {
  // Do something with the collection
  console.log(collection);
  console.log(collection.products);
});
```

### Creating a Checkout
```javascript
// Create an empty checkout
client.checkout.create().then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

### Adding Line Items
```javascript
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID of an existing checkout
const lineItemsToAdd = [
  {variantId: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yOTEwNjAyMjc5Mg==', quantity: 5}
];

// Add an item to the checkout
client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Array with one additional line item
});
```

### Updating Line Items
```javascript
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID of an existing checkout
const lineItemsToUpdate = [
  {id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=', quantity: 2}
];

// Update the line item on the checkout (change the quantity or variant)
client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Quantity of line item 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=' updated to 2
});
```

### Removing Line Items
```javascript
const checkoutId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0SW1hZ2UvMTgyMTc3ODc1OTI='; // ID of an existing checkout
const lineItemIdsToRemove = [
  'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ='
];

// Remove an item from the checkout
client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Checkout with line item 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc4NTc5ODkzODQ=' removed
});
```

### Fetching a Checkout
```javascript
const checkoutId = '2U4NWNkYzI4ZWEyOTdlOD9rZXk9MDVjMzY3Zjk3YWM0YWJjNGRhMTkwMDgwYTUzOGJmYmI='

client.checkout.fetch(checkoutId).then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

## Example Apps

For more complete examples of using JS Buy SDK, check out our [storefront-api-examples](https://github.com/Shopify/storefront-api-examples) project.
There are JS Buy SDK specific example apps in Node, Ember, and React. You can use these examples as a guideline for creating your own custom storefront.

## Documentation

For full API documentation go check out the [API docs](https://shopify.github.io/js-buy-sdk).

## Contributing
For help on setting up the repo locally, building, testing, and contributing
please see [CONTRIBUTING.md](https://github.com/Shopify/js-buy-sdk/blob/master/CONTRIBUTING.md).

## Code of Conduct
All developers who wish to contribute through code or issues, take a look at the
[CODE_OF_CONDUCT.md](https://github.com/Shopify/js-buy-sdk/blob/master/CODE_OF_CONDUCT.md).

## License

MIT, see [LICENSE.md](https://github.com/Shopify/js-buy-sdk/blob/master/LICENSE.txt) for details.

<img src="https://cdn.shopify.com/shopify-marketing_assets/builds/19.0.0/shopify-full-color-black.svg" width="200" />
