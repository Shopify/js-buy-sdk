# [Shopify](https://www.shopify.com) JavaScript Buy SDK
[![Circle CI](https://circleci.com/gh/Shopify/js-buy-sdk.png?circle-token=3be0ebe6fbb4841442b86678696947bd4b5456d7)](https://circleci.com/gh/Shopify/js-buy-sdk)

**Note**: This is the `README` for the current stable v0.x version. v1 of JS Buy SDK is under development in the `v1.0alpha` branch.
See the [README](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/README.md) for more details.

The JS Buy SDK is a lightweight library that allows you to build ecommerce into
any website. It's based on Shopify's GraphQL API and provides the ability to
retrieve products and collections from your shop, add products to a cart, and
checkout.

Docs are still a work in progress, but you can view the [API docs](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/docs).

## Table Of Contents

- [Installation](#installation)
- [Builds](#builds)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation
**With Yarn:**
```bash
$ yarn add shopify-buy@alpha
```
**With NPM:**
```bash
$ npm install shopify-buy@alpha
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
import Client, {Config} from 'shopify-buy';

const config = new Config({
  domain: 'your-shop-name.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token'
});

const client = new Client(config);
```

### Fetching Products
```javascript
// Fetch all products in your shop
client.fetchAllProducts().then((products) => {
  // Do something with the products
  console.log(products);
});

// Fetch a single product by ID
client.fetchProduct('123456').then((product) => {
  // Do something with the product
  console.log(product);
});
```

### Fetching Collections
```javascript
// Fetch all collections, including their products
client.fetchAllCollectionsWithProducts().then((collections) => {
  // Do something with the collections
  console.log(collections);
  console.log(collections[0].products);
});

// Fetch a single collection by ID, including its products
client.fetchCollectionWithProducts('123456').then((collection) => {
  // Do something with the collection
  console.log(collection);
  console.log(collection.products);
});
```

### Creating, Adding and Removing Items from a Checkout
```javascript
// Create an empty checkout
client.createCheckout().then((checkout) => {
  const addLineItemsInput = {
    checkoutId: checkout.id,
    lineItems: [
      {variantId: 'gid://shopify/ProductVariant/12345', quantity: 5}
    ]
  };

  // Add an item to the checkout
  client.addLineItems(addLineItemsInput).then((checkoutWithAddedLineItems) => {
    // Do something with the updated checkout
    console.log(checkoutWithAddedLineItems.lineItems); // Array with one line item

    const removeLineItemsInput = {
      checkoutId: checkoutWithAddedLineItems.id,
      lineItemIds: [
        checkoutWithAddedLineItems.lineItems[0].id
      ]
    };

    // Remove an item from the checkout
    client.removeLineItems(removeLineItemsInput).then((checkoutWithRemovedLineItems) => {
      // Do something with the updated checkout
      console.log(checkoutWithRemovedLineItems.lineItems); // Empty array
    });
  });
});
```

### Fetching a Checkout
```javascript
client.fetchCheckout('123456').then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

## Documentation

For full API documentation go check out the [API docs](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/docs).

## Contributing
For help on setting up the repo locally, building, testing, and contributing
please see [CONTRIBUTING.md](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/CONTRIBUTING.md).

## Code of Conduct
All developers who wish to contribute through code or issues, take a look at the
[CODE_OF_CONDUCT.md](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/CODE_OF_CONDUCT.md).

## License

MIT, see [LICENSE.md](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/LICENSE.txt) for details.

<img src="https://cdn.shopify.com/shopify-marketing_assets/builds/19.0.0/shopify-full-color-black.svg" width="200" />
