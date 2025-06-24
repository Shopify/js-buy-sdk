> [!CAUTION]
>
> # Deprecation notice
>
> **Note: The JS Buy SDK is deprecated as of January, 2025.** It will no longer be updated or maintained by Shopify past that point. A final major version, v3.0, has been released to remove the SDK's dependency on the [deprecated Checkout APIs](https://shopify.dev/changelog/deprecation-of-checkout-apis), replacing them with [Cart APIs](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart). Updating to this new version will allow the SDK to continue to function for most use cases.
>
> If you are using the JS Buy SDK, you have two options:
>
> 1. Recommended Option: switch to the [Storefront API Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme)
>    1. The Storefront API Client manages the API's authentication information and provides various methods that enable devs to interact with the API. This is the preferred and more future-proof solution. See this [migration guide](./migration-guide) to help you transition.
> 2. Stopgap Option: Upgrade to JS Buy SDK v3.0
>    1. This allows you to maintain your current setup with minimal changes for use cases that are supported by the Cart API. A migration guide with details on supported use cases will be available soon. If you choose this option, we still recommend that you switch to the Storefront API Client in the future.
>
> **Critical Deadline: July 1st, 2025.** You must implement one of these changes by this date, or customers will not be able to complete purchases. Please choose the option that best suits your needs and timelines.

# [Shopify](https://www.shopify.com) JavaScript Buy SDK

## 2.x -> 3.0 Migration guide

### How to upgrade to v3.0?

To upgrade simply run either of the following commands

**With npm:**

```bash
npm install shopify-buy@3
```

**With Yarn:**

```bash
yarn add shopify-buy@3
```

**CDN:**

```html
<script src="https://sdks.shopifycdn.com/js-buy-sdk/v3/latest/index.umd.min.js"></script>
```

You can also fetch the unoptimized release. This will be larger than the optimized version, as it will contain all fields that are available in the [Storefront API](https://shopify.dev/docs/api/storefront). This should only be used when you need to add custom queries to supplement the JS Buy SDK queries.

```html
<script src="https://sdks.shopifycdn.com/js-buy-sdk/v3/latest/index.unoptimized.umd.min.js"></script>
```

### How to validate that I am using v3.0?

To validate that the upgrade was successful or that your are using v3.0, open your `package.json` and make sure the `shopify-buy` dependency is set to `3.0.0` or higher.

In addition, you can check that the client is using the Cart API by monitoring the network tab on your preferred developer tools when adding an item to the cart. If you see that the operation performed was `cartCreate`, `cartLinesUpdate`, or `cartLinesAdd` rather than `checkoutCreate`, then you are using v3.0.

### How will I know my ecommerce experience will still work after I take action?

If you migrate to Storefront API Client, there is virtually no use case that can’t be addressed with the right technical implementation. Upfront planning and following the migration guide will be critical to a smooth successful migration. If you decide to switch to JS Buy SDK v3.0, the majority of use cases should still work successfully, but there's no guarantee it will work with future Shopify features. Additionally, there are several fields that are no longer compatible:

> [!NOTE]
> If you don't use any of these fields, you only have to bump the package version and everything will work.

#### Fields no longer supported

| field            | compatibility | notes                              | solution?                                                                                                                                                                                                               |
| ---------------- | ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| completedAt      | ⚠️            | Not supported. Defaults to `null`  | The Cart API does not maintain the state of a completed Cart that became an order.                                                                                                                                      |
| order            | ⚠️            | Not supported. Defaults to `null`  | To retrieve customer orders, please use either the [Customer Account API](https://shopify.dev/docs/api/customer) or the legacy [Customer API](https://shopify.dev/docs/api/storefront/2025-01/objects/customer).        |
| orderStatusUrl   | ⚠️            | Not supported. Defaults to `null`  | Same as above                                                                                                                                                                                                           |
| ready            | ⚠️            | Not supported. Defaults to `false` | The [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) only returns carts that are considered ready. Simply bypass or remove any existing code depending on this field.                           |
| requiresShipping | ⚠️            | Not supported. Defaults to `true`  | The [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) does not contain shipping information, this is currently handled in the Checkout flow. Remove any existing code depending on these fields. |
| shippingLine     | ⚠️            | Not supported. Defaults to `null`  | Same as above                                                                                                                                                                                                           |
| taxExempt        | ⚠️            | Not supported. Defaults to `false` | The [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) is not tax aware, as taxes are currently handled in the Checkout flow. Remove any existing code depending on this field.               |
| taxesIncluded    | ⚠️            | Not supported. Defaults to `false` | Same as above                                                                                                                                                                                                           |
| discountApplications | ✅⚠️          | If a buyer's shipping address is unknown and a shipping discount is applied, shipping discount information is **no longer** returned | In this situation, the [Cart API](https://shopify.dev/docs/api/storefront/2025-01/objects/cart) does not return any information about the value of the shipping discount (eg: whether it's a 100% discount or a $5 off discount)

#### Updated `.checkout` methods

The updated checkout interface supports all existing methods with some limitations:

| method                | compatibility | notes                                                                                                                                                                                              |
| --------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetch                 | ✅            |                                                                                                                                                                                                    |
| create                | ✅⚠️          | - Does not create localized checkouts when passing `presentmentCurrencyCode` <br /> - Does not localize an _empty_ checkout created with `buyerIdentity.countryCode`. (Must create with lineItems) |
| updateAttributes      | ✅⚠️          | - Does not update a checkout to support `allowPartialAddresses`                                                                                                                                 |
| updateEmail           | ✅            |                                                                                                                                                                                                    |
| addLineItems          | ✅            |                                                                                                                                                                                                    |
| replaceLineItems      | ✅            |                                                                                                                                                                                                    |
| updateLineItems       | ✅            |                                                                                                                                                                                                    |
| removeLineItems       | ✅            |                                                                                                                                                                                                    |
| addDiscount           | ✅            | - Does not apply order-level discounts to an empty checkout                                 |
| removeDiscount        | ✅            |                                                                                                                                                                                                    |
| addGiftCards          | ✅            |                                                                                                                                                                                                    |
| removeGiftCard        | ✅            |                                                                                                                                                                                                    |
| updateShippingAddress | ✅            |                                                                                                                                                                                                    |

### FAQ

<details>

<summary>Why is the JS Buy SDK being deprecated?</summary>

We know the important role the JS Buy SDK library played in allowing merchants to create ecommerce experiences. When it was first released in 2016, our main priority was to provide quick and easy ways to interact with our GraphQL APIs. However, over the years, a lot has changed and the SDK is no longer the optimal client to fully leverage all of Shopify capabilities.

</details>

<details>

<summary>What do I need to do now? </summary>

You have multiple options: a) switch to the Storefront API Client, our recommendation and more future-proof solution; see [our migration guide](https://github.com/Shopify/js-buy-sdk/tree/main/migration-guide) to help you transition, and also take a look at the Storefront API Client [docs](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme) and [npm package](https://www.npmjs.com/package/@shopify/storefront-api-client) or b) upgrade to JS Buy SDK v3.0, our last and final release of the JS Buy SDK library. See [this upgrade guide](https://github.com/Shopify/js-buy-sdk/blob/main/README.md#how-to-upgrade-to-v30) to install v3.0. c) switch to [one of our other solutions](https://www.shopify.com/online).

Shopify has evolved since the JS Buy SDK was first released, so we encourage you to explore and determine if one of our [themes](https://themes.shopify.com/) for an Online Store is a better fit for your needs. This action must be completed before July 1, 2025 11:00 AM ET.

</details>

<details>

<summary>Something’s gone wrong and I’m not sure what it is. Is the JS Buy SDK the reason?</summary>

The only functionality that should be affected by the upgrade to JS Buy SDK v3.0 is the cart and checkout. For example, customers can’t complete purchases or the website crashes when a customer attempts to add to cart or view their cart. Other possible issues could be related to any existing workflows that rely on the `.order`, `.completedAt` or any other no longer supported Checkout specific fields. We have set these fields to their default values to mitigate any breaking changes, but we can’t guarantee all existing functionality.

If you are experiencing issues, we recommend you check if you are using any [fields](https://github.com/Shopify/js-buy-sdk/tree/main?tab=readme-ov-file#fields-no-longer-supported) that are no longer supported in v3.0.

</details>

<details>

<summary>What if I run into issues upgrading?</summary>

You may be using one of the [fields that are no longer supported in JS Buy SDK v3.0](https://github.com/Shopify/js-buy-sdk/tree/main?tab=readme-ov-file#fields-no-longer-supported). If you are not a developer, we recommend contacting the people who last worked on your store, whether that was to initially build it or help maintain it over time. If you are looking to work with an agency, check out our [partner directory](https://www.shopify.com/partners/directory) for more information.

</details>

<details>

<summary>What will happen to the Buy Button and the Buy Button JS library?</summary>

Buy Buttons that were created through the Shopify Admin [Buy Button channel](https://apps.shopify.com/buy-button) will work without any intervention and there is no action required. The [Buy Button JS](https://shopify.dev/docs/storefronts/headless/additional-sdks/buy-button) library will be updated to use v3.0 of JS Buy SDK and users of the library will need to upgrade their version of Buy Button JS.
</details>

<details>

<summary>How do I find out if my store is using JS Buy SDK?</summary>

If your store is affected, you will have received an email from us. Another way to verify is to search for `shopify-buy` in your codebase or the snippets you embedded into your site. If this is not possible, then we recommend contacting a third-party provider or search our [partner directory](https://www.shopify.com/partners/directory) for support.

</details>

<details>

<summary>I think I’m on an earlier version of JS Buy SDK. How do I upgrade to v3.0?</summary>

We’d recommend reviewing our [changelog](https://github.com/Shopify/js-buy-sdk/blob/main/CHANGELOG.md) to first upgrade your store to v2.22.0 of the JS Buy SDK, and then upgrade to v3.0 after that. In addition, we are constantly evolving our [solutions](https://www.shopify.com/online) and we encourage you to explore them and see if one might better fit your needs.

</details>

<details>

<summary>What happens if I do not take any action?</summary>

If you do not take any action before July 1, 2025 11:00 AM ET, your store will lose the ability for customers to complete purchases and your site may become unavailable for users with existing carts.

</details>

<details>

<summary>I read that the Checkout API is being deprecated in April 2025, but the JS Buy SDK that uses Checkout APIs is being deprecated on July 1, 2025. Which date is it? and what if I can’t complete the upgrade by April?</summary>

All merchants using JS Buy SDK will be granted an automatic one-time extension to complete the switch to v3.0 before July 1, 2025 at 11:00 AM ET. The JS Buy SDK v3.0 update removes the dependency on Checkout APIs and replaces them with Cart APIs. This means that when you call methods on the Checkout resource, they’ll use Cart APIs instead. We did our best to keep the inputs and outputs the same, but some features from the Checkout APIs do not have a Cart API equivalent, so please test thoroughly after upgrading.

</details>

<details>

<summary>How long will JS Buy SDK v3.0 be supported? </summary>

JS Buy SDK v3.0 will be supported until January 1, 2026. Upgrading to JS Buy SDK v3.0 should be considered a short-term solution before implementing a long-term solution such as [Storefront API Client](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme), [Hydrogen](https://hydrogen.shopify.dev/), or [Storefront Web Components](https://shopify.dev/docs/storefronts/headless/additional-sdks/web-components) or [Online Store Editor](https://www.shopify.com/website/builder).

</details>

<details>

<summary>Why would I upgrade to JS Buy SDK v3.0 if it’s the last and final release?</summary>

This option is the easiest and fastest way to remain functional and give you more time to consider, plan, and implement a better long-term solution such as using the Storefront API Client.

</details>

<details>

<summary>How long will it take to migrate to Storefront API Client? </summary>

This will heavily depend on your ecommerce experience and what level of technical resources you have available. If you do not have access to technical resources or are unsure where to begin, you can review the [migration guide](https://github.com/Shopify/js-buy-sdk/tree/main/migration-guide), or contact a [third-party agency](https://www.shopify.com/partners/directory) who could provide consultation.

</details>

<details>

<summary>How will I know I have successfully switched to JS Buy SDK v3.0?</summary>

Once you have updated your project to use v3.0, you can check your `package.json` to ensure that the `shopify-buy` dependency is now at `3.0.0` or higher. In addition you can check that the client is using the Cart API by monitoring the network tab of your preferred developer tools when adding a line item to the cart. If you see that the operation performed was `cartCreate`, `cartLinesUpdate`, or `cartLinesAdd` rather than `checkoutCreate`, then you have switched to v3.0 successfully. [More information](https://github.com/Shopify/js-buy-sdk/blob/main/README.md#how-to-validate-that-i-am-using-v30)

</details>

<details>

<summary>I’m debating if I should migrate to the Storefront API Client. What are the benefits?</summary>

Migrating to the Storefront API Client is a great way to future-proof your ecommerce experience by gaining full control over how your store interacts with Shopify APIs. You will get access to [globally-deployed Carts](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage), offering improved performance, scalability, and a richer feature set including subscriptions, product bundles, contextual pricing, Shopify Functions, UI extensions, and more. In addition, we have other solutions available that might better fit your needs [Hydrogen](https://hydrogen.shopify.dev/), or [Storefront Web Components](https://shopify.dev/docs/storefronts/headless/additional-sdks/web-components) or [Online Store Editor](https://www.shopify.com/website/builder).
</details>

<details>

<summary>Where can I find the Checkout interface documentation? </summary>

The Checkout API is deprecated. To find the legacy documentation for v2.x, you can visit this [page](https://github.com/Shopify/js-buy-sdk/blob/main/CHECKOUT_DOCS.md).

</details>

---

![Build](https://github.com/shopify/js-buy-sdk/actions/workflows/ci.yml/badge.svg)

The JS Buy SDK is a lightweight library that allows you to build ecommerce into
any website. It's based on Shopify's [Storefront API](https://help.shopify.com/api/storefront-api/getting-started)
and provides the ability to retrieve products and collections from your shop, add products to a cart, and checkout.

[Full API docs are available here](https://help.shopify.com/en/api/storefront-api/reference).

## Changelog

View our [Changelog](https://github.com/Shopify/js-buy-sdk/blob/main/CHANGELOG.md) for details about our releases.

## SDK Version Support

Each version of the JS Buy SDK uses a specific Storefront API version and the support of an SDK version is directly linked to the support of the corresponding Storefront API version. Storefront API versioning information can be found [here](https://shopify.dev/docs/api/usage/versioning).

## Table Of Contents

- [Builds](#builds)
- [Examples](#examples)
  - [Initializing the Client](#initializing-the-client)
  - [Fetching Products](#fetching-products)
  - [Fetching Collections](#fetching-collections)
- [Expanding the SDK](#expanding-the-sdk)
  - [Initializing the Client](#initializing-the-client-1)
  - [Fetching Products](#fetching-products-1)
- [Example Apps](#example-apps)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Builds

The JS Buy SDK has four build versions: ES, CommonJS, AMD, and UMD.

**ES, CommonJS:**

```javascript
import Client from "shopify-buy";
```

**AMD:**

```javascript
import Client from "shopify-buy/index.amd";
```

**UMD:**

```javascript
import Client from "shopify-buy/index.umd";
```

**UMD Unoptimized:**
This will be larger than the optimized version, as it will contain all fields that are available in the [Storefront API](https://help.shopify.com/en/api/custom-storefronts/storefront-api/reference). This should only be used when you need to add custom queries to supplement the JS Buy SDK queries.

```javascript
import Client from "shopify-buy/index.unoptimized.umd";
```

## Examples

### Initializing the Client

If your store supports multiple languages, Storefront API can return translated resource types and fields. Learn more about [translating content](https://help.shopify.com/en/api/guides/multi-language/translating-content-api).

```javascript
import Client from "shopify-buy";

// Initializing a client to return content in the store's primary language
const client = Client.buildClient({
  domain: "your-shop-name.myshopify.com",
  storefrontAccessToken: "your-storefront-access-token",
});

// Initializing a client to return translated content
const clientWithTranslatedContent = Client.buildClient({
  domain: "your-shop-name.myshopify.com",
  storefrontAccessToken: "your-storefront-access-token",
  language: "ja-JP",
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
const productId = "gid://shopify/Product/7857989384";

client.product.fetch(productId).then((product) => {
  // Do something with the product
  console.log(product);
});

// Fetch a single product by Handle
const handle = "product-handle";

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
const collectionId = "gid://shopify/Collection/369312584";
// Set a parameter for first x products, defaults to 20 if you don't provide a param

client.collection
  .fetchWithProducts(collectionId, { productsFirst: 10 })
  .then((collection) => {
    // Do something with the collection
    console.log(collection);
    console.log(collection.products);
  });
```

## Expanding the SDK

Not all fields that are available on the [Storefront API](https://help.shopify.com/en/api/custom-storefronts/storefront-api/reference) are exposed through the SDK. If you use the unoptimized version of the SDK, you can easily build your own queries. In order to do this, use the UMD Unoptimized build.

### Initializing the Client

```javascript
// fetch the large, unoptimized version of the SDK
import Client from "shopify-buy/index.unoptimized.umd";

const client = Client.buildClient({
  domain: "your-shop-name.myshopify.com",
  storefrontAccessToken: "your-storefront-access-token",
});
```

### Fetching Products

```javascript
// Build a custom products query using the unoptimized version of the SDK
const productsQuery = client.graphQLClient.query((root) => {
  root.addConnection("products", { args: { first: 10 } }, (product) => {
    product.add("title");
    product.add("tags"); // Add fields to be returned
  });
});

// Call the send method with the custom products query
client.graphQLClient.send(productsQuery).then(({ model, data }) => {
  // Do something with the products
  console.log(model);
});
```

## Documentation

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
