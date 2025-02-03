> [!CAUTION]
> # Deprecation notice
> **Note: The JS Buy SDK is deprecated as of January, 2025.** It will no longer be updated or maintained by Shopify past that point. A final major version will be released in January 2025 to remove the SDK's dependency on the [deprecated Checkout APIs](https://shopify.dev/changelog/deprecation-of-checkout-apis), replacing them with [Cart APIs](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart). Updating to this new version will allow the SDK to continue to function for most use cases.
>
> If you are using the JS Buy SDK, you have two options:
>
> 1. Recommended Option: switch to the [Storefront API Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme)
>    1. The Storefront API Client manages the API's authentication information and provides various methods that enable devs to interact with the API. This is the preferred and more future-proof solution. See this [migration guide](./migration-guide) to help you transition.
>
> 2. Stopgap Option: Upgrade to JS Buy SDK V3 (coming soon)
>    1. This allows you to maintain your current setup with minimal changes for use cases that are supported by the Cart API. A migration guide with details on supported use cases will be available soon. If you choose this option, we still recommend that you switch to the Storefront API Client in the future.
>
> **Critical Deadline: July 1st, 2025.** You must implement one of these changes by this date, or customers will not be able to complete purchases. Please choose the option that best suits your needs and timelines.

# [Shopify](https://www.shopify.com) JavaScript Buy SDK

## Deprecation Notice

The JavaScript Buy SDK `v3.0` will be the final release of this library. The main goal of this version is to extend the gracing period of SDK `.checkout` interface by replacing it with an equivalent interface based on the [Cart API](https://shopify.dev/docs/api/storefront/latest/objects/Cart) with some limitations inherit to the different scope of both APIs.

## How to upgrade to v3.0?

To upgrade simply run either of the following commands

If using NPM

```bash 
npm install shopify-buy@3
```

If using Yarn

```bash 
yarn install shopify-buy@3
```

## How to validate that I am using v3.0?

To validate that the upgrade was successful or that your are using v3.0, open your `package.json` and make sure the `shopify-buy` dependency is set to `3.0.0` or higher.

In addition you can check that the client is using the Cart API by monitoring the network tab on your preferred developer tools when adding a line item to the cart. If you see that the operation performed was `cartLinesAdd` rather than `checkoutCreate`, then you are using v3.0.

## FAQ

### Why is the JS Buy SDK being deprecated?

We know the important role the JS Buy SDK library played in allowing merchants to create e-commerce experiences. When it was first released in 2016, our main priority was to provide quick and easy ways to interact with our GraphQL APIs. However, over the years, a lot has changed and the SDK is no longer the optimal client to fully leverage all of Shopify capabilities.

### What do I need to do now?

You have multiple options: a) switch to the Storefront API Client, our recommendation and more future-proof solution; see [our migration guide](https://github.com/Shopify/js-buy-sdk/tree/sd-deprecation/migration-guide) to help you transition, [docs](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme), [NPM package](https://www.npmjs.com/package/@shopify/storefront-api-client) or b) upgrade to JS Buy SDK V3, our last and final release of the JS Buy SDK library. See [this upgrade guide](https://github.com/Shopify/js-buy-sdk/blob/main/README.md##how-to-upgrade-to-v30) to install v3.0. c) switch to [one of our other solutions](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started). 

Shopify has evolved since the JS Buy SDK was first released, so we encourage you to explore and determine if one of our themes for an Online Store is a better fit for your needs. This action must be completed before July 1, 2025 11:00 AM ET. 

### Something’s gone wrong and I’m not sure what it is. Is the JS Buy SDK the reason?

The only functionality that should be affected is the cart and checkout. For example, customers can’t complete purchases or the website crashes when a customer attempts to add to cart or view their cart. Other possible issues could be related to any existing workflows that rely on the `.order`, `.completedAt` or any other no longer supported Checkout specific fields. We have set these fields to their default values to mitigate any breaking changes, but we can’t guarantee all existing functionality.

### What if I run into issues upgrading?

You may be using one of the fields that is no longer supported in JS Buy SDK v3.0. If you are not a developer, we recommend contacting the people who last worked on your store, whether that was to initially build it or help maintain it over time. If you are looking to work with an agency, check out our [partner directory](https://www.shopify.com/partners/directory) for more information.

### How do I find out if my store is using JS Buy SDK?

If your store is affected, you would have received an email from us. Another way to verify is to search for `shopify-buy` in your codebase or the snippets you embedded into your site. If this is not possible, then we recommend contacting a third-party partner.

### I think I’m on an earlier version of JS Buy SDK. How do I upgrade to v3.0?

We’d recommend reviewing our [changelog](https://github.com/Shopify/js-buy-sdk/blob/main/CHANGELOG.md) to first upgrade your store to v2.22.0 of the JS Buy SDK, and then upgrade to v3.0 after that. In addition, we are constantly evolving our [solutions](https://www.shopify.com/online) and we encourage you to explore them and see if one might better fit your needs.

### What happens if I do not take any action?

If you do not take any action before `July 1, 2025 11:00 AM ET`, your store will lose the ability for customers to complete purchases and your site may become unavailable for users with existing carts.


### I read that the Checkout API is being deprecated in April 2025, but the JS Buy SDK that uses Checkout APIs is being deprecated on July 1, 2025. Which date is it? and what if I can’t complete the upgrade by April?

All merchants using JS Buy SDK will be granted an automatic one-time extension to complete the switch to v3.0 before July 1, 2025 at 11:00 AM ET. The JS Buy SDK v3.0 update removes the dependency on Checkout APIs and replaces them with Cart APIs. This means that when you call methods on the Checkout resource, they’ll use Cart APIs instead. We did our best to keep the inputs and outputs the same, but some features from the Checkout APIs do not have a Cart API equivalent, so please test thoroughly after upgrading.

### How long will JS Buy SDK v3.0 be supported?

JS Buy SDK v3.0 will be supported until January 1, 2026. Upgrading to JS Buy SDK v3.0 should be considered a short-term solution before implementing a long-term solution such as [Storefront Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme), [Hydrogen](https://hydrogen.shopify.dev/), or [Storefront Web Components](https://shopify.dev/docs/storefronts/headless/additional-sdks/web-components) or [Online Store Editor](https://www.shopify.com/website/builder).

### Why would I upgrade to JS Buy SDK v3.0 if it’s the last and final release?

This option is the easiest and fastest way to remain functional and give you more time to consider, plan and implement a better long-term solution such as using the Storefront Client.


### How long will it take to migrate to Storefront API Client? 

This will heavily depend on your e-commerce experience and what level of technical resources you have available. If you do not have access to technical resources or are unsure where to begin, you can review the [migration guide](https://github.com/Shopify/js-buy-sdk/tree/sd-deprecation/migration-guide), or contact a [third-party agency](https://www.shopify.com/partners/directory) who could provide consultation.

### How will I know I have successfully switched to JS Buy SDK v3.0?

Once you have updated your project to use v3.0, you can check your package.json to ensure that the `shopify-buy` dependency is now at 3.0.0. In addition you can check that the client is using the Cart API  by monitoring the network tab of your preferred developer tools when adding a line item to the cart. If you see that the operation performed was `cartLinesAdd` rather than `checkoutCreate`, then you have switched to v3.0 successfully. [More information](https://github.com/Shopify/js-buy-sdk#how-validate-that-i-am-using-v30)

### I’m debating if I should migrate to the Storefront API Client. What are the benefits?

Migrating to the Storefront API Client is a great way to future-proof your e-commerce experience by gaining full control on how your store interacts with Shopify APIs. You will get access to [globally-deployed Carts](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage), offering improved performance, scalability, and a richer feature set including subscriptions, product bundles, contextual pricing, Shopify Functions, and UI extensions, and more. In addition, we have other solutions available that might better fit your needs like Hydrogen, Storefront Web Components or Online Store Editor.

### How will I know my e-commerce experience will still work after I take action?

If you migrate to Storefront API Client, there is virtually no use case that can’t be addressed with the right technical implementation. Upfront planning and following the migration guide will be critical to a smooth successful migration. If you decide to switch to the JS Buy SDK v3.0, the majority of use cases should still work successfully, but there’s no guarantee it will work with future Shopify features. Additionally, there are several fields that are no longer compatible:

#### Fields no longer supported

| field | compatibility  | notes  | solution? |
|---|---|---|---|
| completedAt | ⚠️ | Not supported. Defaults to `null` | The Cart API does not maintain the state of a completed Cart that became an order. |
| order | ⚠️ | Not supported. Defaults to `null` | To retrieve customer orders, please use either the [Customer Account API](https://shopify.dev/docs/api/customer) or the legacy [Customer API](https://shopify.dev/docs/api/storefront/2025-01/objects/customer). |
| orderStatusUrl | ⚠️ | Not supported. Defaults to `null` | same as above |
| ready | ⚠️ | Not supported. Defaults to `false` | The [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) returns only carts that are considered ready. Simply bypass or remove any existing code depending on this field. |
| requiresShipping | ⚠️ | Not supported. Defaults to `true` | The [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) does not contain shipping information, this is currently handled in the Checkout flow. Remove any existing code depending on these fields. |
| shippingLine | ⚠️ | Not supported. Defaults to `null` | same as above |
| taxExempt | ⚠️ | Not supported. Defaults to `false` | 
The [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) does not have Tax aware as this is currently handled in the Checkout flow. Remove any existing code depending on this field. |
| taxesIncluded | ⚠️ | Not supported. Defaults to `false` | same as above |


#### Updated `.checkout` methods

The updated checkout interface supports all existing methods with some limitations:

| method | compatibility  | notes |
|---|---|---|
| fetch | ✅ |   |
| create | ✅⚠️ | - Does not create localized checkouts when passing `presentmentCurrencyCode` <br /> - Does not localize an _empty_ checkout created with `buyerIdentity.countryCode`. (Must create with lineItems) |
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


### [after July 1] I’m very upset! My customers are not able to complete their purchases. What’s going on?

If your customers are not able to complete purchases, we recommend you first verify if your e-commerce experience is using the JS Buy SDK. You can verify this by checking the `package.json` as highlighted in our validation guide. If this is the case, then there are two options available:

a. Switch to the [Storefront API Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme), which manages the API's authentication information and provides various methods that enable devs to interact with the API. This is the preferred and more future-proof solution. 

b. Upgrade to JS Buy SDK v3.0. This latest version will work for most use cases and the process is more straightforward. We created a [migration guide](https://github.com/Shopify/js-buy-sdk/tree/sd-deprecation/migration-guide) to help you upgrade.

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
