# [Shopify](https://www.shopify.com) JavaScript Buy SDK

> [!WARNING]  
> This library is now deprecated.

## Deprecation Notice

The JavaScript Buy SDK `v3.0` will be the final release of this library. The main goal of this version is to extend the gracing period of SDK `.checkout` interface by replacing it with an equivalent interface based on the [Cart API](https://shopify.dev/docs/api/storefront/latest/objects/Cart) with some limitations inherit to the different scope of both APIs.

## Updated SDK Checkout interface

Prior to v3.0 the SDK [checkout interface](https://shopify.github.io/js-buy-sdk/#creating-a-checkout) used the [deprecated](https://shopify.dev/changelog/deprecation-of-checkout-apis) [Checkout API](https://shopify.dev/docs/api/storefront/2024-04/objects/Checkout) to handle both Cart and Checkout use cases. This updated `.checkout` interface is now based on the Cart API, which means that it can only handle Cart use cases supported by the current API.

## Cart-based checkout object compatibility table

The following table highlights the supported and _unsupported_ fields returned in the mimicked checkout object

| field | compatibility  | notes  |
|---|---|:-:|
| appliedGiftCards | ✅ |   |
| createdAt | ✅ |   |
| currencyCode | ✅ |   |
| customAttributes | ✅ |   |
| discountApplications | ✅ |   |
| email | ✅ |   |
| id | ✅ℹ️ | The return ID will be a Cart ID e.g `gid://shopify/Cart/...` |
| lineItems | ✅ |   |
| lineItemsSubtotalPrice | ✅ |   |
| note  | ✅ |   |
| paymentDue | ✅ |   |
| paymentDueV2 | ✅ |   |
| shippingAddress | ✅ |   |
| subtotalPrice | ✅ |   |
| subtotalPriceV2 | ✅ |   |
| totalPrice | ✅ |   |
| totalPriceV2 | ✅ |   |
| totalTax | ✅ |   |
| totalTaxV2 | ✅ |   |
| updatedAt | ✅ |   |
| webUrl | ✅ |   |

Fields _not_ supported

| field | compatibility  | notes  |
|---|---|:-:|
| completedAt | ⚠️ | Not supported. Defaults to `null` |
| order | ⚠️ | Not supported. Defaults to `null` |
| orderStatusUrl | ⚠️ | Not supported. Defaults to `null` |
| ready | ⚠️ | Not supported. Defaults to `false` |
| requiresShipping | ⚠️ | Not supported. Defaults to `true` |
| shippingLine | ⚠️ | Not supported. Defaults to `null` |
| taxExempt | ⚠️ | Not supported. Defaults to `false` |
| taxesIncluded | ⚠️ | Not supported. Defaults to `false` |

### `.checkout` methods compatibility table

The updated checkout interface supports all existing methods with some limitations:

| method | compatibility  | notes |
|---|---|:-:|
| fetch | ✅ |   |
| create | ✅⚠️ | - Does not create a localized checkout when passing `presentmentCurrencyCode` <br /> - Does not localize an _empty_ checkout created with `buyerIdentity.countryCode`. (Must create with lineItems) |
| updateAttributes | ✅⚠️ | - It does not update a checkout to support `allowPartialAddresses` |
| updateEmail  | ✅ |   |
| addLineItems | ✅ |   |
| replaceLineItems | ✅ |   |
| updateLineItems | ✅ |   |
| removeLineItems | ✅ |   |
| addDiscount | ✅ | - It does not apply an order-level fixed amount discount to an empty checkout <br />  - It does not apply an order-level percentage discount to an empty checkout |
| removeDiscount | ✅ |   |
| addGiftCards | ✅ |   |
| removeGiftCard | ✅ |   |
| updateShippingAddress | ✅ |   |

### Other considerations

---

![Build](https://github.com/shopify/js-buy-sdk/actions/workflows/ci.yml/badge.svg)

**Note**: For help with migrating from v0 of JS Buy SDK to v1 check out the
[Migration Guide](https://github.com/Shopify/js-buy-sdk/blob/main/tutorials/MIGRATION_GUIDE.md).

The JS Buy SDK is a lightweight library that allows you to build ecommerce into
any website. It's based on Shopify's [Storefront API](https://help.shopify.com/api/storefront-api/getting-started)
and provides the ability to retrieve products and collections from your shop, add products to a cart, and checkout.

[Full API docs are available here](https://help.shopify.com/en/api/storefront-api/reference).

## Changelog

View our [Changelog](https://github.com/Shopify/js-buy-sdk/blob/main/CHANGELOG.md) for details about our releases.

## SDK Version Support

Each version of the JS Buy SDK uses a specific Storefront API version and the support of an SDK version is directly linked to the support of the corresponding Storefront API version. Storefront API versioning information can be found [here](https://shopify.dev/docs/api/usage/versioning).

## Table Of Contents

- [Installation](#installation)
- [Builds](#builds)
- [Examples](#examples)
  - [Initializing the Client](#initializing-the-client)
  - [Fetching Products](#fetching-products)
  - [Fetching Collections](#fetching-collections)
  - [Carts](#carts)
    - [Creating a Cart](#creating-a-cart)
    - [Fetching a Cart](#fetching-a-cart)
    - [Updating Cart Attributes](#updating-cart-attributes)
    - [Updating Buyer Identity](#updating-buyer-identity)
    - [Updating Discount Codes](#updating-discount-codes)
    - [Updating Gift Card Codes](#updating-gift-card-codes)
    - [Adding Cart Line Items](#adding-cart-line-items)
    - [Removing Cart Line Items](#removing-cart-line-items)
    - [Updating Cart Line Items](#updating-cart-line-items)
    - [Updating Cart Notes](#updating-cart-notes)
    - [Updating Cart Selected Delivery Options](#updating-cart-selected-delivery-options)
    - [Redirecting to Checkout](#redirecting-to-checkout)
  - [Checkouts](#checkouts)
    - [Creating a Checkout](#creating-a-checkout)
    - [Updating Checkout Attributes](#updating-checkout-attributes)
    - [Adding Line Items](#adding-line-items)
    - [Updating Line Items](#updating-line-items)
    - [Removing Line Items](#removing-line-items)
    - [Fetching a Checkout](#fetching-a-checkout)
    - [Adding a Discount](#adding-a-discount)
    - [Removing a Discount](#removing-a-discount)
    - [Updating a Shipping Address](#updating-a-shipping-address)
    - [Completing a checkout](#completing-a-checkout)
- [Expanding the SDK](#expanding-the-sdk)
  - [Initializing the Client](#initializing-the-client-1)
  - [Fetching Products](#fetching-products-1)
- [Example Apps](#example-apps)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Installation

**With Yarn:**

```bash
yarn add shopify-buy
```

**With NPM:**

```bash
npm install shopify-buy
```

**CDN:**

There is a minified UMD build of the latest release available via CDN (see the [Changelog](https://github.com/Shopify/js-buy-sdk/blob/main/CHANGELOG.md) for details about the latest release):

```html
<script src="https://sdks.shopifycdn.com/js-buy-sdk/v2/latest/index.umd.min.js"></script>
```

If you **don't** want to use the latest version, you can use a specific older release version:

```html
<script src="https://sdks.shopifycdn.com/js-buy-sdk/1.11.0/index.umd.min.js"></script>
```

You can also fetch the unoptimized release for a version (2.0.1 and above). This will be larger than the optimized version, as it will contain all fields that are available in the [Storefront API](https://help.shopify.com/en/api/custom-storefronts/storefront-api/reference):

```html
<script src="https://sdks.shopifycdn.com/js-buy-sdk/2.0.1/index.unoptimized.umd.min.js"></script>
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

**UMD Unoptimized:**
This will be larger than the optimized version, as it will contain all fields that are available in the [Storefront API](https://help.shopify.com/en/api/custom-storefronts/storefront-api/reference). This should only be used when you need to add custom queries to supplement the JS Buy SDK queries.

```javascript
import Client from 'shopify-buy/index.unoptimized.umd';
```

## Examples

### Initializing the Client

If your store supports multiple languages, Storefront API can return translated resource types and fields. Learn more about [translating content](https://help.shopify.com/en/api/guides/multi-language/translating-content-api).

```javascript
import Client from 'shopify-buy';

// Initializing a client to return content in the store's primary language
const client = Client.buildClient({
  domain: 'your-shop-name.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token'
});

// Initializing a client to return translated content
const clientWithTranslatedContent = Client.buildClient({
  domain: 'your-shop-name.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token',
  language: 'ja-JP'
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
const productId = 'gid://shopify/Product/7857989384';

client.product.fetch(productId).then((product) => {
  // Do something with the product
  console.log(product);
});

// Fetch a single product by Handle
const handle = 'product-handle';

client.product.fetchByHandle(handle).then((product) => {
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
const collectionId = 'gid://shopify/Collection/369312584';
// Set a parameter for first x products, defaults to 20 if you don't provide a param

client.collection.fetchWithProducts(collectionId, {productsFirst: 10}).then((collection) => {
  // Do something with the collection
  console.log(collection);
  console.log(collection.products);
});
```

## Carts

### Creating a Cart

```javascript
const input = {
  lines: {
    merchandiseId: 'gid://shopify/ProductVariant/13666012889144',
    quantity: 5,
    attributes: [{key: "MyKey", value: "MyValue"}]
  },
  note: 'This is a cart note!'
];

// Create a cart
client.cart.create(input).then((cart) => {
  // Do something with the cart
});
```

### Fetching a Cart

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR'

client.cart.fetch(cartId).then((cart) => {
  // Do something with the cart
});
```

### Updating Cart Attributes

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const attributes = [{key: "MyKey", value: "MyValue"}];

client.cart.updateAttributes(cartId, attributes).then((cart) => {
  // Do something with the updated cart
});
```

### Updating Buyer Identity

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const buyerIdentity = {email: "hello@hi.com"};

client.cart.updateBuyerIdentity(cartId, buyerIdentity).then((cart) => {
  // Do something with the updated cart
});
```

### Updating Discount Codes

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const discountCodes = [{code: "MyCode"}];

client.cart.updateDiscountCodes(cartId, discountCodes).then((cart) => {
  // Do something with the updated cart
});
```

### Updating Gift Card Codes

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const giftCardCodes = ["jmfxf9wmmmhgq379"];

client.cart.updateGiftCardCodes(cartId, giftCardCodes).then((cart) => {
  // Do something with the updated cart
});

### Adding Cart Line Items

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const lines = [{merchandiseId: 'gid://shopify/Product/123456', quantity: 5}];

client.cart.addLineItems(cartId, lines).then((cart) => {
  // Do something with the updated cart
});
```

### Removing Cart Line Items

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const lineIdsToRemove = ['gid://shopify/CartLineItem/123456'];

client.cart.addLineItems(cartId, lineIdsToRemove).then((cart) => {
  // Do something with the updated cart
});
```

### Updating Cart Line Items

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const lines = [{id: 'gid://shopify/CartLineItem/123456', quantity: 5}];

client.cart.updateLineItems(cartId, lines).then((cart) => {
  // Do something with the updated cart
});
```

### Updating Cart Notes

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const note = 'A note for the cart';

client.cart.updateNote(cartId, note).then((cart) => {
  // Do something with the updated cart
}
```

### Updating Cart Selected Delivery Options

```javascript
const cartId = 'gid://shopify/Cart/Z2NwLXVzLWVhc3QxOjAxSE5WWTAyVjlETjFDNVowVFZEWVMwMVJR';
const selectedDeliveryOptions = [{deliveryGroupId: 'gid://shopify/CartDeliveryGroup/269ea2856c41d63937d1ba5212c29713', deliveryOptionHandle: 'standard'}];

client.cart.updateSelectedDeliveryOptions(cartId, selectedDeliveryOptions).then((cart) => {
  // Do something with the updated cart
});
```

### Redirecting to Checkout

To complete the purchase, redirect customers to the `checkoutUrl` property attached to the cart.

## Checkouts

> [!WARNING]
> Checkouts will [soon be deprecated](https://github.com/Shopify/storefront-api-feedback/discussions/225). Use [Carts](#carts) instead.

### Creating a Checkout

```javascript
// Create an empty checkout
client.checkout.create().then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

### Updating checkout attributes

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8';
const input = {customAttributes: [{key: "MyKey", value: "MyValue"}]};

client.checkout.updateAttributes(checkoutId, input).then((checkout) => {
  // Do something with the updated checkout
});
```

### Adding Line Items

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const lineItemsToAdd = [
  {
    variantId: 'gid://shopify/ProductVariant/29106064584',
    quantity: 5,
    customAttributes: [{key: "MyKey", value: "MyValue"}]
  }
];

// Add an item to the checkout
client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Array with one additional line item
});
```

### Updating Line Items

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const lineItemsToUpdate = [
  {id: 'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef', quantity: 2}
];

// Update the line item on the checkout (change the quantity or variant)
client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Quantity of line item 'gid://shopify/Product/7857989384' updated to 2
});
```

### Removing Line Items

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const lineItemIdsToRemove = [
  'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef'
];

// Remove an item from the checkout
client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
  // Do something with the updated checkout
  console.log(checkout.lineItems); // Checkout with line item 'gid://shopify/CheckoutLineItem/194677729198640?checkout=e3bd71f7248c806f33725a53e33931ef' removed
});
```

### Fetching a Checkout

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'

client.checkout.fetch(checkoutId).then((checkout) => {
  // Do something with the checkout
  console.log(checkout);
});
```

### Adding a Discount

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout
const discountCode = 'best-discount-ever';

// Add a discount code to the checkout
client.checkout.addDiscount(checkoutId, discountCode).then(checkout => {
  // Do something with the updated checkout
  console.log(checkout);
});
```

### Removing a Discount

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout

// Removes the applied discount from an existing checkout.
client.checkout.removeDiscount(checkoutId).then(checkout => {
  // Do something with the updated checkout
  console.log(checkout);
});
```

### Updating a Shipping Address

```javascript
const checkoutId = 'gid://shopify/Checkout/e3bd71f7248c806f33725a53e33931ef?key=47092e448529068d1be52e5051603af8'; // ID of an existing checkout

const shippingAddress = {
   address1: 'Chestnut Street 92',
   address2: 'Apartment 2',
   city: 'Louisville',
   company: null,
   country: 'United States',
   firstName: 'Bob',
   lastName: 'Norman',
   phone: '555-625-1199',
   province: 'Kentucky',
   zip: '40202'
 };

// Update the shipping address for an existing checkout.
client.checkout.updateShippingAddress(checkoutId, shippingAddress).then(checkout => {
  // Do something with the updated checkout
});
```

### Completing a checkout

The simplest way to complete a checkout is to use the [webUrl](https://help.shopify.com/en/api/storefront-api/reference/object/checkout) property that is returned when creating a checkout. This URL redirects the customer to Shopify's [online checkout](https://help.shopify.com/en/manual/checkout-settings) to complete the purchase.

## Expanding the SDK

Not all fields that are available on the [Storefront API](https://help.shopify.com/en/api/custom-storefronts/storefront-api/reference) are exposed through the SDK. If you use the unoptimized version of the SDK, you can easily build your own queries. In order to do this, use the UMD Unoptimized build.

### Initializing the Client

```javascript
// fetch the large, unoptimized version of the SDK
import Client from 'shopify-buy/index.unoptimized.umd';

const client = Client.buildClient({
  domain: 'your-shop-name.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token'
});
```

### Fetching Products

```javascript
// Build a custom products query using the unoptimized version of the SDK
const productsQuery = client.graphQLClient.query((root) => {
  root.addConnection('products', {args: {first: 10}}, (product) => {
    product.add('title');
    product.add('tags');// Add fields to be returned
  });
});

// Call the send method with the custom products query
client.graphQLClient.send(productsQuery).then(({model, data}) => {
  // Do something with the products
  console.log(model);
});

```

## Example Apps

For more complete examples of using JS Buy SDK, check out our [storefront-api-examples](https://github.com/Shopify/storefront-api-examples) project.
There are JS Buy SDK specific example apps in Node, Ember, and React. You can use these examples as a guideline for creating your own custom storefront.

## Documentation

- [Getting started guide](https://help.shopify.com/en/api/storefront-api/tools/js-buy-sdk/getting-started)
- [API documentation](https://shopify.github.io/js-buy-sdk).

## Contributing

For help on setting up the repo locally, building, testing, and contributing
please see [CONTRIBUTING.md](https://github.com/Shopify/js-buy-sdk/blob/main/CONTRIBUTING.md).

## Code of Conduct

All developers who wish to contribute through code or issues, take a look at the
[CODE_OF_CONDUCT.md](https://github.com/Shopify/js-buy-sdk/blob/main/CODE_OF_CONDUCT.md).

## License

MIT, see [LICENSE.md](https://github.com/Shopify/js-buy-sdk/blob/main/LICENSE.txt) for details.

<img src="https://cdn.shopify.com/shopify-marketing_assets/builds/19.0.0/shopify-full-color-black.svg" width="200" />
