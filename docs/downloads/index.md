---
layout: default
---

{% assign versionSplit = site.data.package.version | split: "." %}
{% assign majorVersion = versionSplit[ 0 ] %}

# Downloads

The SDK is available as a UMD build which supports CommonJS, AMD, and global module systems. A CDN-hosted version is available on the Shopify CDN, or you can download the package from NPM or Github.

## Quick Start

To get up and running quickly, copy the following snippet and add it to your site's `<head>` element.

```html
<script src="http://sdks.shopifycdn.com/js-buy-sdk/v{{majorVersion}}/latest/shopify-buy.umd.polyfilled.min.js"></script>
```

<button class="marketing-button copy-button" data-clipboard-text="<script src=&quot;http://sdks.shopifycdn.com/js-buy-sdk/v{{majorVersion}}/latest/shopify-buy.umd.polyfilled.min.js&quot;></script>">Copy to clipboard</button>

## NPM Package

The JavaScript Buy SDK is available via NPM as `shopify-buy`, and can be installed with the following command:

```
npm install shopify-buy
```

<button class="marketing-button copy-button" data-clipboard-text="npm install shopify-buy">Copy to clipboard</button>

## CDN Package

{% include downloads.html %}

## Source code
The JavaScript Buy SDK is open source and available on [Github](https://github.com/Shopify/js-buy-sdk/)

## Polyfills
The JavaScript Buy SDK uses the [Fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) to make network requests, and [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) for managing asynchronous behaviour. Fetch is natively supported in Chrome, Firefox, and Opera, and Promises are supported in Chrome, Firefox, Opera, Safari, and Edge. If you are targeting those browsers specifically, you can include the un-polyfilled version of the SDK. If you are targeting broader browser support, you will want to include the polyfilled version, which includes polyfills for both the Promises and Fetch APIs.
