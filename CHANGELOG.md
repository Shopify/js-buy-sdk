# Changelog

> [!CAUTION]
> ## Deprecation notice
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

### v3.0.7 (June 24, 2025)
* Fix bug where discount codes that were previously added (but not applicable) would be removed
    * Now, all discount codes (applicable or not) are preserved when adding other discount codes
* Fix bug where a shipping discount could appear as a line item discount

### v3.0.6 (June 17, 2025)
* Update `checkout.webUrl` to use the same domain as JS Buy SDK v2
    * Without this change, if the shop's Online Store primary domain isn't configured correctly and pointing to Shopify, some buyers are unable to checkout successfully.

### Internal fix for behaviour of all `webUrl`s returned by JS Buy SDK (June 17, 2025)
* Buyers will no longer be blocked from checkout and redirected to the shop's password page when clicking on the checkout's `webUrl` with JS Buy SDK v3, even if the shop's Online Store is password protected (to match behaviour of v2)

### v3.0.5 (June 17, 2025)
* Gracefully abort discount mapping if errors occur
    * An error has been reported in a scenario where a discount was applied at checkout via a script, but the user navigated back to the store (without completing checkout) and JS Buy SDK v3 was erroring when attempting to map the new cart payload.
    * We are going to continue investigating to fix the root cause, but aborting discount mapping in this scenario as a temporary fix is a better user experience in the meantime
* Fix bug where discount code acceptance was case sensitive; now is case-insensitive

### v3.0.4 (April 14, 2025)
* Checkout resource now supports [ComponentizableCartLine type](https://shopify.dev/docs/api/storefront/2024-07/objects/ComponentizableCartLine) (to match behaviour of v2)

### v3.0.3 (April 1, 2025)
* Updated `checkout.addDiscount` to support adding multiple discount codes (to match behaviour of v2)

### v3.0.2 (March 25, 2025)
* Fix bug where the checkout resource would only return the first 10 line items; now returns the first 250 line items

### v3.0.1 (March 20, 2025)
* Same as v3.0.0 but published on npm with provenance

### v3.0.0 (March 12, 2025)
* Bumps the SDK to use Storefront API version `2025-01`.
* Removes the dependency on Checkout APIs and replaces them with Cart APIs.
* For more information, see the [migration guide](https://github.com/Shopify/js-buy-sdk/blob/main/README.md#2x---30-migration-guide).

### v2.22.0 (May 1, 2024)
* Bumps the SDK to use Storefront API version `2024-04`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2024-04).

### v2.21.1 (October 5, 2023)
* Bumps the SDK to use Storefront API version `2023-10`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2023-10).

### v2.20.1 (July 19, 2023)
* [Update `schema.json`](https://github.com/Shopify/js-buy-sdk/pull/963) to match Storefront API version `2023-07` schema.

### v2.20.0 (July 5, 2023)
* Bumps the SDK to use Storefront API version `2023-07`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2023-07).

### v2.19.0 (April 4, 2023)
* Bumps the SDK to use Storefront API version `2023-04`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2023-04).
* [Security patch](https://github.com/Shopify/js-buy-sdk/pull/940) handlebars version vulnerability

### v2.18.0 (January 9, 2023)
* Bumps the SDK to use Storefront API version `2023-01`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2023-01).

### v2.17.1 (November 2, 2022)
* Removed the common `MoneyFragment` and replaced all usage of the fragment with the corresponding `MoneyV2` fields. This fixes an error that was occuring when `client.fetchNextPage()` is called

### v2.17.0 (October 11, 2022)
* Bumps the SDK to use Storefront API version `2022-10`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2022-10).
* **NOTABLE API DATA CHANGE:** Storefront API version `2022-10` includes the removal of the `Money` scalar and all fields that had previously returned a [Money](https://shopify.dev/api/storefront/2022-07/scalars/Money) scalar will now return a [MoneyV2](https://shopify.dev/api/storefront/2022-10/objects/MoneyV2) object. Affected fields include:
  * AppliedGiftCard fields: `amountUsed`, `balance`
  * Checkout fields: `paymentDue`, `totalTax`, `subtotalPrice`, `totalPrice`
  * ShippingRate fields: `price`
  * Order fields: `subtotalPrice`, `totalShippingPrice`, `totalTax`, `totalPrice`, `totalRefunded`
  * ProductVariant fields: `price`, `compareAtPrice`

### v2.16.1 (July 5, 2022)
* Bumps the SDK to use Storefront API version `2022-07`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2022-07).
* Alias all instances of `Image.src` to use `Image.url`.

### v2.15.1 (April 4, 2022)
* Bumps the SDK to use Storefront API version `2022-04`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2022-04).
* Add `product.fetchRecommendations` function that allows for fetching recommended products for a product.

### v2.14.0 (January 6, 2022)
* Bumps the SDK to use Storefront API version `2022-01`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2022-01).
* Replace deprecated `description` with `title` in `ScriptDiscountApplication` typed `value` object in discount application fragment
* Remove deprecated `currencyCode` from shop fragment
* Remove deprecated `presentmentPrices` from product variant fragment

### v2.13.0 (October 28, 2021)
* Bumps the SDK to use Storefront API version `2021-10`. For more information, see the [Release Notes](https://shopify.dev/api/release-notes/2021-10).
* Add image `width` and `height` fields to the `ProductFragment` and `VariantFragment`.

### v2.12.0 (August 30, 2021)
* Bumps the SDK to use Storefront API version `2021-07`. For more information, see the [Release Notes](https://shopify.dev/concepts/about-apis/versioning/release-notes/2021-07).

### v2.11.0 (July 7, 2020)
* Bumps the SDK to use Storefront API version `2020-07`. For more information, see the [Release Notes](https://shopify.dev/concepts/about-apis/versioning/release-notes/2020-07).

### v2.10.0 (April 24, 2020)
* Bumps the SDK to use Storefront API version `2020-04`. For more information, see the [Release Notes](https://shopify.dev/concepts/about-apis/versioning/release-notes/2020-04).

### v2.9.3 (April 6, 2020)
* Update code of conduct report link

### v2.9.2 (March 23, 2020)
* Update the client to always set the `accept-language` header for all requests and will use `*` as the default value when a language config is not set during client initialization

### v2.9.1 (February 19, 2020)
* Update `handleCheckoutMutation` to invoke proper schema level error when no data/model is provided

### v2.9.0 (January 8, 2020)
* Bumps the SDK to use Storefront API version `2020-01`. For more information, see the [Release Notes](https://help.shopify.com/en/api/versioning/release-notes/2020-01#storefront-api-changes).
* Adds a language option to the client config to support retrieving translated content from the Storefront API. For more information, see the [Multi-Language API Guide](https://help.shopify.com/en/api/guides/multi-language/translating-content-api).
* Adds `compareAtPrice` to the `presentmentPrices` object in the variant fragment
* Adds `unitPrice` and `unitPriceMeasurement` fields to the variant fragment
* Updates `graphql-js-client` to fix an error when calling `fetchNextPage` for products in the `fetchWithProducts` and `fetchAllWithProducts` collection queries

### v2.8.1 (November 15, 2019)
* Updates some description strings in the Storefront API schema version `2019-10`.
* Adds an optional param to `collection.fetchWithProducts` for specifying the number of products to return.
* Adds `priceV2` to the `shippingLine` object in the checkout fragment
* Update the [contributing guide](https://github.com/Shopify/js-buy-sdk/blob/main/CONTRIBUTING.md) to recommend using `yarn` instead of `npm`.

### v2.8.0 (October 3, 2019)
* Bumps the SDK to use Storefront API version `2019-10`. For more information, see the [Release Notes](https://help.shopify.com/en/api/versioning/release-notes/2019-10#storefront-api-changes).

### v2.7.2 (September 18, 2019)
* Fixed error caused by getting additional images and variants information when product is null

### v2.7.1 (August 26, 2019)
* Update header configuration

### v2.7.0 (August 12, 2019)
* Add the following fields to the queries:
  - VariantFrament: `priceV2`, `compareAtPriceV2`
  - DiscountApplicationFragment: `value`

### v2.6.1 (July 4, 2019)
* Includes code changes missed in previous version (2.6.0) to send all requests to API version 2019-07.

### v2.6.0 (July 3, 2018)
* Introduces API Versioning! Starting with this release, each release will be tied to a new API version. Learn more about versioning [here](https://help.shopify.com/en/api/versioning).
* Exposes the following information in the graphql schema:
  - Queryroot field `publicApiVersions` - list of supported API versions
  - Checkout field `requiresShipping`
  - CheckoutErrorCode: `BAD_DOMAIN`, `INVALID_FOR_COUNTRY`, `GIFT_CARD_DEPLETED`, `TOTAL_PRICE_MISMATCH`

### v2.5.0 (Jun 18, 2019)
* Add the following fields to the queries:
  - AppliedGiftCard: `presentmentAmountUsed`.
  - CheckoutFragment: `paymentDueV2`, `totalTaxV2`, `subtotalPriceV2`, `totalPriceV2`.
  - order: `subtotalPriceV2`, `totalShippingPriceV2`, `totalTaxV2`, `totalPriceV2`, `totalRefundedV2`.
  - VariantFrament: `presentmentPrices`.
  - ShopQuery: `paymentSettings` (that includes `enabledPresentmentCurrencies`)

### v2.4.0 (Jun 13, 2019)
* Bump the graphql schema to pull the latest fields:
  - Applied Gift Card field `presentmentAmountUsed`
  - Payment field `amountV2`
  - Product field `presentmentPriceRanges`
  - Transaction field `amountV2`

### v2.3.0 (Jun 13, 2019)
* Duplicate of v2.4.0

### v2.2.4 (May 14, 2019)
* Bump the graphql schema to pull the latest fields into the unoptimized version:
  - ProductVariant fields: `metafield`, `metafields`
  - Product fields: `metafield`, `metafields`
  - QueryRoot field: `productRecommendations`
* Add `handle` to checkout's line item's variant's product.

### v2.2.3 (May 8, 2019)
- Add support for the `checkoutGiftCardsAppend` and `checkoutGiftCardRemoveV2` mutations, which allows clients to add and remove gift cards from a checkout.

### v2.2.2 (April 17, 2019)
* Bump the graphql schema to pull the latest fields into the unoptimized version:
  - Order fields: `subtotalPriceV2`, `totalPriceV2`, `totalRefundedV2`, `totalShippingPriceV2`, `totalTaxV2`
  - ProductVariant fields: `compareAtPriceV2`, `priceV2`
  - Checkout fields: `paymentDueV2`, `subtotalPriceV2`, `totalPriceV2`, `totalTaxV2`
  - AppliedGiftCard fields: `balanceV2`, `amountUsedV2`
  - Shop field: `presentmentCurrencyCode`
  - ShippingRate field: `priceV2`

These fields are all of type `MoneyV2` and contain both an amount and a currency.

### v2.2.1 (April 10, 2019)
- Bump the graphql-js-client package, which [fixes support](https://github.com/Shopify/graphql-js-client/pull/128) for IE browsers

### v2.2.0 (March 28, 2019)
- Add currency support for Bermudian Dollar
- Add seo field to article which exposes SEO title and description information
- Deprecate `status` field on transaction and replaces it with `statusV2`, which supports a null status.
- Add `lineItemsSubtotalPrice` field to checkout. It contains the sum of all line items prices before any tax, shipping or discount applications.

### v2.1.1 (March 7, 2019)
- Bump the graphql-js-client package, which [includes support](https://github.com/Shopify/graphql-js-client/pull/121) for falling back when a GraphQL interface object can't be translated.

### v2.1.0 (February 25, 2019)
- Add support for the `checkoutShippingAddressUpdateV2` mutation, which allows clients to update the shipping address of a checkout.
- Add the `checkoutUserErrors` field to all of the checkout mutation fragments that did not previously contain this.

### v2.0.1 (January 14, 2019)
- Build an unoptimized release version that contains all fields that are available in the [Storefront API](https://help.shopify.com/en/api/custom-storefronts/storefront-api/reference).

### v2.0.0 (January 3, 2019)
- Fetch `collections`, `products`, `collectionByHandle` and `productByHandle` from the QueryRoot instead of from the Shop object.
- Return `checkoutUserErrors` instead of `userErrors` when present. This will add an extra field called code.
- Expose `checkoutLineItemsReplace` mutation (to replace deprecated `checkoutLineItemsAdd`, `checkoutLineItemsRemove`, and `checkoutLineItemsUpdate` mutations).
- Remove unused fixtures

### v1.11.0 (November 27, 2018)
- Added availableForSale field to Product query fragment
- Removed tags field from Product query fragment
- Add field aliasing to deprecated fields in affected query fragments:
   - availableForSale on VariantFragment
   - countryCode on CheckoutFragment
   - src on CollectionFragment and VariantFragment

### v1.10.0 (November 7, 2018)
- Updates deprecated Storefront API methods used for some checkout mutations.

### v1.9.1 (October 24, 2018)
- Specifies pageInfo for discountApplications connection

### [UNSAFE] v1.9.0 (October 23, 2018)
- Updates schema.json
- Support checkoutDiscountCodeRemove mutation
- Exposes discounts on the checkout Object
- Allows a null checkout response from CheckoutResource.fetch (#563)

### v1.8.0 (August 30, 2018)
- Support checkoutEmailUpdate mutation

### v0.1.3 (March 30, 2016)
- Adds IE9 support for `atob` and `btoa` using polyfills via #52
- Cleans up some deployment noise (#54). Thanks @tessalt

### v0.1.0 (March 22, 2016)
