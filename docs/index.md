---
layout: default
---

{% assign versionSplit = site.data.package.version | split: "." %}
{% assign majorVersion = versionSplit[ 0 ] %}

# Shopify JavaScript Buy SDK

The JS Buy SDK is a lightweight library that allows you to build ecommerce into any website.
It is based on Shopify's API and provides the ability to retrieve products and collections from your shop,
add products to a cart, and checkout.

It can render data on the client side or server. This will allow you to add ecommerce functionality to any website or
javascript application. This is helpful if you already have a website and need to add ecommerce or only need a simple buy button on your site.

Using the JS Buy SDK, you can:

- fetch information about a single product or a collection of products
- create a shopping cart
- allow customers to select options and quantities
- generate a checkout URL for a single product or an entire cart.

This tool is intended for use by developers who are experienced with JavaScript.

## Current Support

| Internet Explorer     | Chrome, Edge, Firefox     | Safari   | Opera   | iOS   | Android   |
| :-------------------- | :------------------------ | :------- | :------ | :---- | :-------- |
| 9+                   | (Current - 1) or Current  | 5.1+     | 12.1x, (Current - 1) or Current | 6.1+ | 2.3, 4.0+

## Including the Buy SDK

### via NPM
```
npm install shopify-buy
```

### via CDN
```html
<script src="http://sdks.shopifycdn.com/js-buy-sdk/v{{majorVersion}}/latest/shopify-buy.umd.polyfilled.min.js"></script>
```

<button class="marketing-button copy-button" data-clipboard-text="<script src=&quot;http://sdks.shopifycdn.com/js-buy-sdk/latest/shopify-buy.polyfilled.globals.min.js&quot;></script>">Copy to clipboard</button>

## Creating a Shop Client

The Client is the primary interface through which you make requests using the JS Buy SDK.
You will need your `myshopify.com` domain, API key, and application ID to create your client and
begin making requests. <a href="https://docs.shopify.com/api/sdks/js-buy-sdk/getting-started#app-id" target="_blank">Where do I find my API Key and application ID?</a>

```js
var shopClient = ShopifyBuy.buildClient({
  apiKey: 'your-api-key',
  domain: 'your-shop-subdomain.myshopify.com',
  appId: '6'
});
```

> Note: You will need to publish the product/<a href="https://docs.shopify.com/manual/products/collections/make-collections-findable#change-the-visibility-of-a-collection" target="_blank">collection</a> you wish to interact with to the
> "Buy Button" channel in Shopify.

## Making a request

You can now call a `fetch` method on your client to retrieve products or collections.
All `fetch` methods return a promise which will return a `Cart` or `Collection` model for `fetchProduct`
or `fetchCollection`, or an array of `Cart` or `Collection` models for `fetchAllProducts` or `fetchAllCollection`.

To request an individual resource, you will need to pass that resource's ID as the first argument. <a href="https://docs.shopify.com/api/sdks/js-buy-sdk/getting-started#retrieving-products" target="_blank">How do I find my resource ID?</a>

```js
const shopClient = ShopifyBuy.buildClient({
  apiKey: 'bf081e860bc9dc1ce0654fdfbc20892d',
  appId: '6',
  domain: 'embeds.myshopify.com'
});

// fetch a product using resource id
shopClient.fetchProduct('8569911558')
  .then(function (product) {
    console.log(product);
  })
  .catch(function () {
    console.log('Request failed');
  });
```

## Creating a Cart

To create a cart, use the `client.createCart()` function:

```js
var cart;
shopClient.createCart().then(function (newCart) {
  cart = newCart;
  // do something with updated cart
});
```

### Adding items to a cart

Cart items can be retrieved as an array with the `cart.lineItems` getter. To add items to a cart,
you can call the cart’s `addVariants` method and pass in the product(s) to be added.
The `update` call will return a promise which returns the updated model.

```js
cart.addVariants({variant: product.selectedVariant, quantity: 1}).then(function (cart) {
  // do something with updated cart
});
```

### Creating a checkout URL

You can generate a checkout URL for a given cart at any time by retrieving the `cart.checkoutUrl`.

```js
document.location.href = cart.checkoutUrl;
```
