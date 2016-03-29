---
layout: default
---
# Downloads

## Quick Start

The SDK is available as CommonJS, AMD, and global modules. CDN-hosted versions are available on the Shopify CDN, or you can download the package from NPM or Github. To get up and running quickly, copy the following snippet and add it to your site's `<head>` element.

```html
<script src="http://sdks.shopifycdn.com/js-buy-sdk/latest/shopify-buy.polyfilled.globals.min.js"></script>
```

<button class="marketing-button copy-button" data-clipboard-text="<script src='http://sdks.shopifycdn.com/js-buy-sdk/latest/shopify-buy.polyfilled.globals.min.js'></script>">Copy</button>

## NPM Package

The JavaScript Buy SDK is available via NPM as `shopify-buy`, and can be installed with the following command:

```
npm install shopify-buy
```

## CDN Package

{% include downloads.html %}

## Source code
The JavaScript Buy SDK is open source and available on [Github](https://github.com/Shopify/js-buy-sdk/)

## Polyfills
The JavaScript Buy SDK uses the [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) to make network requests, and [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) for managing asynchronous behaviour. Fetch is natively supported in Chrome, Firefox, and Opera, and Promises are supported in Chrome, Firefox, Opera, Safari, and Edge. If you are targeting those browsers specifically, you can include the un-polyfilled version of the SDK. If you are targeting broader browser support, you will want to include the polyfilled version, which includes polyfills for both the Promises and Fetch APIs.
