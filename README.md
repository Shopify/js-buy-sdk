# [Shopify](https://www.shopify.com) JavaScript Buy SDK
[![Circle CI](https://circleci.com/gh/Shopify/js-buy-sdk.png?circle-token=3be0ebe6fbb4841442b86678696947bd4b5456d7)](https://circleci.com/gh/Shopify/js-buy-sdk)

**Note**: This is the `README` for the current stable v0.x version. v1 of JS Buy SDK is under development in the `v1.0alpha` branch.
See the [README](https://github.com/Shopify/js-buy-sdk/blob/v1.0alpha/README.md) for more details.

The JS Buy SDK is a lightweight library that allows you to build ecommerce into
any website. It's based on Shopify's JSON API and provides the ability to
retrieve products and collections from your shop, add products to a cart, and
checkout.

If you're just getting started, please [read the docs](http://shopify.github.io/js-buy-sdk/).

## Example
```javascript
const shopClient = ShopifyBuy.buildClient({
  accessToken: 'bf081e860bc9dc1ce0654fdfbc20892d',
  appId: 6,
  domain: 'embeds.myshopify.com'
});

shopClient.fetchAllProducts()
.then(function (products) {
  console.log(products);
})
.catch(function () {
  console.log('Request failed');
});
```

## Documentation

For full API documentation go checkout the [API docs](http://shopify.github.io/js-buy-sdk/).

## Contributing
For help on setting up the repo locally, building, testing, and contributing
please see [CONTRIBUTING.md](https://github.com/Shopify/js-buy-sdk/blob/master/CONTRIBUTING.md).

## Code of Conduct
All developers who wish to contribute through code or issues, take a look at the
[CODE_OF_CONDUCT.md](https://github.com/Shopify/js-buy-sdk/blob/master/CODE_OF_CONDUCT.md).
