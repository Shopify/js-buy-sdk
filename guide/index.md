---
layout: default
---

# JS Buy SDK Guide

This guide assumes you have read the documentation on the [Getting Started](/js-buy-sdk/) guide.

The code examples in this guide should be mostly DOM-agnostic, so you should be able to integrate them
into whatever code you are using to create and update your DOM, whether you are doing so manually
or using a library/framework.

To see how the JS Buy SDK can be integrated with various frameworks and approaches, take a look at
the [examples](/js-buy-sdk/examples).

## Creating a single "Buy Button" that links to checkout

Once you have created your `ShopClient` ([see documentation here](/js-buy-sdk/#creating-a-shop-client)), fetch information about your product to display in your UI:

```js
var product;
shopClient.fetchProduct(1234)
  .then(function (product) {
    product = product;
  });
```

To generate a checkout URL for this product, you will need to create a cart object and add the product variant
you want to the cart:

```js
var variant = product.variants[0];
var checkoutURL;

shopClient.create('checkouts', {
  line_items: [{
    id: variant.id,
    quantity: 1
  }]
}).then(function (cart) {
  checkoutURL = cart.attrs.web_url;
});
```

Once you have obtained a checkout URL, you can insert this URL into the DOM by your preferred method.

> Note: The calls to both `shopClient.fetchProduct` and `shopClient.create` are *asynchronous*, meaning that
> you will have to ensure that any attempt to render the checkoutURL occurs after both calls are completed.

## Managing a Cart with the JS Buy SDK

The JavaScript Buy SDK provides several convenience methods for managing a local Cart object, and synchronizing
this cart with Shopify to obtain an accurate checkout link.

### Initializing a cart

Initializing a cart without passing through a variant will produce an empty cart which you can then
add and remove variants from.

```js
var cart;
shopClient.create('checkouts').then(function (cart) {
  // do something with updated cart
});
```

### Adding items to a cart

Items are added to the cart by calling the cart's `addVariants` method, which accepts one or more objects containing
a variant ID and quantity. `addVariants` will update the cart and synchronize it with Shopify. If you add a
variant ID that already exists in the cart, that line item's quantity will be incremented.

> Note: `addVariants` accepts a variable number of arguments, each of which must be an object containing an id and quantity.

```js
cart.addVariants({id: 123, quantity: 1}).then(function (cart) {
  // do something with updated cart
});
```
> *Note:* `cart` is modified by calling `addVariants`

### Updating cart items

You can update the quantity of items in the cart with the `updateLineItem` method, which accepts a cart item ID and a new quantity
for the line item. If the quantity is less than 1, the line item will be removed.  

```js
cart.updateLineItem(123, 1).then(function (cart) {
  // do something with updated cart
});

cart.removeLineItem(123).then(function (cart) {
  // do something with updated cart
});
```

> Note: Cart item IDs are strings, not integers

You can remove all items from a cart with the `clearLineItems` method.

## Selecting variants

A product's options are accessed through `product.options`. Each option has a `values` property which is an array of possible values.
To generate a `<select>` menus for a product's options, you would have to loop over the `product.options` array and the `values` array for each option.

```js
var selects = product.options.map(function (option) {
  return '<select name="' + option.name + '">' + option.values.map(function(value) {
    return '<option value="' + value + '">' + value + '</option>';
  });
})
```

You can also use buttons or radio inputs to allow customers to select options, but in any case you will need to update the selected variant based
on the user's selection.

### Updating selected variant

When a customer selects an option, you will need to set the `selected` property for that option to the selected value. For example:

```js
var optionName, selectedValue;
// option Name and selected value obtained from DOM/user interaction

var option = product.options.filter(function (option) {
  return option.name === optionName;
})[0];

option.value = selectedValue;
```

The product's `selectedVariant` property will now reflect the variant matching the selected options.

```js
cart.addVariants({
  id: product.selectedVariant.id,
  quantity: 1
}).then(function (cart) {
  cart = cart;
});
```

### Getting variant Images

When an option is changed and a new variant selected, you may wish to update an image in the DOM to reflect
the correct variant. You can access the URL for this image from `product.selectedVariantImage`

```js
var newSrc = product.selectedVariantImage.src;
```
