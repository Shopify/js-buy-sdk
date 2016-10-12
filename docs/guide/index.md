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

Once you have created your `ShopClient` ([see documentation here](/js-buy-sdk/#creating-a-shop-client)), fetch a product:

```js
shopClient.fetchProduct('8569911558')
  .then(function (product) {
    // do something with the product
  });
```

To generate a checkout URL for this product, you can call `checkoutUrl` on a [Product Variant](/js-buy-sdk/api/classes/ProductVariantModel.html#method-checkoutUrl) and pass in the quantity to be purchased:

```js
shopClient.fetchProduct('8569911558')
  .then(function (product) {
    var variant = product.variants[0];
    var quantity = 1;
    var checkoutURL;

    checkoutURL = variant.checkoutUrl(quantity);
  });
```

Once you have obtained a checkout URL, you can insert this URL into the DOM by your preferred method.

> Note: The calls to both `shopClient.fetchProduct` and `shopClient.create` are *asynchronous*, meaning that
> you will have to ensure that any attempt to render the checkoutURL occurs after both calls are completed.

## Managing a Cart with the JS Buy SDK

The JavaScript Buy SDK provides several convenience methods for managing a [local Cart object](/js-buy-sdk/api/classes/CartModel.html), and synchronizing
this cart with Shopify to obtain an accurate [checkout link](/js-buy-sdk/api/classes/CartModel.html#prop-checkoutUrl).

### Initializing an empty cart

Initializing a cart without passing a variant will produce an empty cart which you can then
add and remove variants from.

```js
shopClient.createCart()
  .then(function (cart) {
    // do something with cart
  });
```

### Adding items to a cart

Items are added to the cart by calling the cart's `createLineItemsFromVariants` method, which accepts one or more objects containing
a variant ID and quantity. `createLineItemsFromVariants` will update the cart and synchronizing it with Shopify. If you add a
variant ID that already exists in the cart, that line item's quantity will be incremented.

> Note: `createLineItemsFromVariants` accepts a variable number of arguments, each of which must be an object containing an id and quantity.

```js
cart.createLineItemsFromVariants({variant: productVariant, quantity: 1})
  .then(function (cart) {
    // do something with updated cart
  });
```
> Note: `cart` is modified by calling `createLineItemsFromVariants`

### Updating cart line items

You can update the quantity of items in the cart with the `updateLineItem` method, which accepts a line item ID and a new quantity
for the line item.

```js
const firstLineItemId = cart.lineItems[0].id;

// the following will set the quantity of the first line item to be 5
cart.updateLineItem(firstLineItemId, 5)
  .then(function (cart) {
    // do something with updated cart
  });
```

### Removing cart line items

You can remove line items by calling `removeLineItem`, which accepts the line item ID to be removed.

```js
const firstLineItemId = cart.lineItems[0].id;

// the following will remove the first line item from the cart
cart.removeLineItem(firstLineItemId)
  .then(function (cart) {
    // do something with updated cart
  });
```

### Clearing cart line items

You can remove all items from a cart with the `clearLineItems` method.

```js
// the following will remove all line item from the cart
cart.clearLineItems()
  .then(function (cart) {
    // do something with updated cart
  });
```

### Initializing a cart with a Variant

Above we showed an example on how to initialize an empty cart. Alternately variants can be passed in during initalization to create a non-empty cart with those variants.

```js
shopClient.createCart({id: 123, quantity: 1})
  .then(function (cart) {
    // do something with cart
  });
```

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
cart.createLineItemsFromVariants({
  variant: product.selectedVariant,
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
