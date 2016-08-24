---
layout: default
---
# Examples

The following examples showcase various simple ways to use the JavaScript Buy SDK to build ecommerce into a website.

## Setup

To use any of the examples, we first have to set up a Shopify Client in our JavaScript. Head over to <a href="{{ '/' | prepend: site.baseurl }}">Getting started</a> for more details.

```js
$(function() {
  var client = ShopifyBuy.buildClient({
    apiKey: 'your-api-key',
    myShopifyDomain: 'your-myshopify-domain',
    appId: '6'
  });
});
```

## Product Checkout

This example illustrates the simplest way to integrate ecommerce into your site to allow the purchasing of a single product. It creates an HTML anchor element that links to the product's checkout URL.

<div class="product" id="product-1"></div>

We are going to create our markup in our JavaScript, therefore our HTML can just include a container element.

```html
<div class="product" id="product-1"></div>
```

After fetching a product with the product ID we use the promise function to generate some markup with the required attributes and content, and add it inside our HTML container element.

```js
client.fetchProduct('your-product-id').then(function(product) {

  var html =
  "<img class='product__image' src='" + product.selectedVariantImage.src + "' >" +
  "<h2 class='product__title'>" + product.title + "</h2>" +
  "<a class='product__buy' href='" +
    product.selectedVariant.checkoutUrl(1) +
  "'>Buy Now!</a>";

  $('#product-1').html(html);

});
```

```css
.product {
  max-width: 400px;
  box-shadow: 0 0 15px 5px #eee;
  padding: 30px;
}

.product__buy {
  background: #7ab55c;
  padding: 0.5625em 1.875em;
  color: white;
  text-decoration: none;
  border-radius: 3px;
  display: inline-block;
}

.product__buy:hover {
  text-decoration: none;
  background: #6aa74c;
}
```

## Product Add-To-Cart

This example illustrates the use of a cart to manage multiple products and variants. Only certain snippets of code will be highlighted from the full example available in a [subfolder in the JS Buy SDK repository](https://github.com/Shopify/js-buy-sdk/tree/master/examples/cart).

<div class="product" id="buy-button-1">
    <img class="variant-image">
    <h1 class="product-title"></h1>
    <h2 class="variant-title"></h2>
    <h2 class="variant-price"></h2>
    <div class="variant-selectors"></div>
    <button class="buy-button button">Add To Cart</button>
  </div>

First, the app makes a call to retrieve the product, and sets a view variables to store the default selected variant, the selected variant's image and the variant options available for the product.

```js
var selectedVariant = product.selectedVariant;
var selectedVariantImage = product.selectedVariantImage;
var currentOptions = product.options;
```

The demo then updates the HTML structure for the product using the `updateProductTitle()`, `updateVariantImage()`, `updateVariantTitle()`, and `updateVariantPrice()` functions, and builds out `select` elements for the product's variant options and appends them to the product's HTML markup.

```js
var variantSelectors = generateSelectors(product);
$('.variant-selectors').html(variantSelectors);
```
```js
function generateSelectors(product) {
  var elements = product.options.map(function(option) {
    return '<select name="' + option.name + '">' + option.values.map(function(value) {
      return '<option value="' + value + '">' + value + '</option>';
    }) + '</select>';
  });

  return elements;
}
```

Various listener functions are called to watch for 'Add to Cart' button clicks, variant option changes, and increment/decrement buttons for the variants in the cart. The `attachOnVariantSelectListeners` function updates the `product.options` when an a selected option is changed, then calls the various update functions with the new selected variant and selected variant's image.

```js
function attachOnVariantSelectListeners(product) {
  $('.variant-selectors').on('change', 'select', function(event) {
    var $element = $(event.target);
    var name = $element.attr('name');
    var value = $element.val();
    product.options.filter(function(option) {
      return option.name === name;
    })[0].selected = value;

    var selectedVariant = product.selectedVariant;
    var selectedVariantImage = product.selectedVariantImage;
    updateVariantImage(selectedVariantImage);
    updateVariantTitle(selectedVariant);
    updateVariantPrice(selectedVariant);
  });
}
```

When a product variant is added to, or removed from, the cart, the `addVariantToCart` function handles a series of things. First, it updates the cart model. It then uses the line items in the cart to build the required markup to display the cart items in the DOM.

```js
...

var $cartLineItems = checkout.lineItems.map(function (lineItem, index) {
  var $lineItemTemplate = $(lineItemEmptyTemplate);
  var itemImage = lineItemImages[lineItem.variant_id];
  $lineItemTemplate.find('.cart-item__img').css('background-image', 'url(' + itemImage + ')');
  $lineItemTemplate.find('.cart-item__title').text(lineItem.title);
  $lineItemTemplate.find('.cart-item__variant-title').text(lineItem.variant_title);
  $lineItemTemplate.find('.cart-item__price').text(formatAsMoney(lineItem.line_price));
  $lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);
  $lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
  $lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);

  if (!existingLineItem && (index === checkout.attrs.line_items.length - 1)) {
    $lineItemTemplate.addClass('js-hidden');
  }
  return $lineItemTemplate;
});
$cartItemContainer.append($cartLineItems);

...
```

## Show/Hide Cart

Additional event listeners are used to toggle the cart's visibility on/off by adding and removing the `js-active` class on the `cart`.

<button class="button js-toggleCart">Toggle Cart</button>

```js
function openCart() {
  $('.cart').addClass('js-active');
}

function closeCart() {
  $('.cart .btn--close').click(function () {
    $('.cart').removeClass('js-active');
  });
}
```

<script id="cart-item-template" type="text/template">
    <div class="cart-item">
      <div class="cart-item__img"></div>
      <div class="cart-item__content">
        <div class="cart-item__content-row">
          <div class="cart-item__variant-title"></div>
          <span class="cart-item__title"></span>
        </div>
        <div class="cart-item__content-row">
          <div class="cart-item__quantity-container">
            <button class="btn--seamless quantity-decrement" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>
            <input class="cart-item__quantity" type="number" min="0" aria-label="Quantity">
            <button class="btn--seamless quantity-increment" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>
          </div>
          <span class="cart-item__price"></span>
        </div>
      </div>
    </div>
  </script>

<!-- .cart begin -->
<div class="cart">

  <!-- .cart-section begin // cart header -->
  <div class="cart-section cart-section--top">
    <h2 class="cart-title">Your cart</h2>
    <button class="btn--close">
      <span aria-role="hidden">×</span>
      <span class="visuallyhidden">Close</span>
    </button>
  </div>
  <!-- .cart-section end -->

  <!-- .cart-form begin // cart body -->
  <div class="cart-form">
    <div class="cart-item-container cart-section">
      <!-- cart items will be added here -->
    </div>

    <!-- .cart-bottom begin -->
    <div class="cart-bottom">
      <div class="cart-info clearfix cart-section">
        <div class="type--caps cart-info__total cart-info__small">Total</div>
        <div class="cart-info__pricing">
          <span class="cart-info__small cart-info__total">CAD</span>
          <span class="pricing pricing--no-padding"></span>
        </div>
      </div>
      <div class="cart-actions-container cart-section type--center">
        <div class="cart-discount-notice cart-info__small">Shipping and discount codes are added at checkout.</div>
        <input type="submit" class="btn btn--cart-checkout" id="checkout" name="checkout" value="Checkout">
      </div>
    </div>
    <!-- .cart-bottom end -->

  </div>
  <!-- .cart-form end -->

</div>
<!-- .cart end -->


<script src="http://sdks.shopifycdn.com/js-buy-sdk/latest/shopify-buy.polyfilled.globals.min.js"></script>
<script src="../assets/scripts/addToCart.js"></script>


<style>
  .product {
    max-width: 400px;
    box-shadow: 0 0 15px 5px #eee;
    padding: 30px;
    margin-bottom: 40px;
  }

  .product__image,
  .variant-image {
    margin: 0 !important;
  }

  .product__buy,
  .button,
  .btn {
    background: #7ab55c;
    font-size: 16px;
    padding: 0.5625em 1.875em !important;
    color: white !important;
    text-decoration: none;
    border-radius: 3px;
    display: inline-block;
    border: none;
    text-shadow: none;
    font-weight: normal;
    transition: 150ms ease-in-out;
  }

  .product__buy:hover,
  .button:hover,
  .btn:hover {
    text-decoration: none;
    background: #6aa74c;
    text-shadow: none;
  }

  .btn--cart-checkout {
    width: 100%;
    text-align: center;
    cursor: pointer;
  }

  .product .variant-title,
  .product .variant-price {
    margin: 0 0 10px !important;
  }

  .variant-selectors {
    margin-bottom: 20px;
  }

  .variant-selectors select {
    width: 100%;
  }

  .cart {
    position: fixed;
    width: 100%;
    max-width: 350px;
    height: 100%;
    right: 0;
    top: 0;
    background: white;
    border-radius: 1px;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
  }

  .cart.js-active {
    transform: translateX(0);
    box-shadow: -5px 0 5px rgba(0, 0, 0, 0.1);
  }

  .cart-section {
    position: relative;
    padding: 20px;
  }

  .cart-section--top {
    z-index: 5;
  }

  h2.cart-title {
    display: inline-block;
    font-weight: 400;
    font-size: 18px;
    line-height: 1.5;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 90%;
    margin-top: 0;
    margin-bottom: 0;
  }

  .btn--close {
    position: absolute;
    right: 9px;
    top: 8px;
    font-size: 35px;
    color: #999;
    border: none;
    background: transparent;
    transition: transform 100ms ease;
    cursor: pointer;
    &:hover {
      transform: scale(1.2);
      color: #666;
    }
  }

  .cart-form {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    padding: 70px 0 140px 0;
  }

  .cart-item-container {
    height: 100%;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    perspective: 400px;
    perspective-origin: 50% 0px;
  }


  .cart-item {
    margin-bottom: 20px;
    overflow: hidden;
    backface-visibility: visible;
    min-height: 65px;
    position: relative;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;  
  }

  .cart-item.js-hidden {
    opacity: 0;
  }

  .cart-item.js-working:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.5);
    z-index: 2;
  }

  .cart-item__img {
    width: 65px;
    height: 65px;
    border-radius: 3px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: #e5e5e5;
    position: absolute;
  }

  .cart-item__content {
    width: 100%;
    padding-left: 75px;
  }

  .cart-item__content-row {
    margin-bottom: 5px;
  }

  .cart-item__variant-title {
    float: right;
    font-weight: bold;
    font-size: 11px;
    line-height: 17px;
    color: #767676;
  }

  .cart-item__quantity-container {
    border: 1px solid #767676;
    float: left;
    border-radius: 3px;
  }

  .quantity-decrement, .quantity-increment {
    color: #767676;
    display: block;
    float: left;
    height: 21px;
    line-height: 16px;
    font-family: monospace;
    width: 25px;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    font-size: 18px;
    text-align: center;
  }

  .cart-item__quantity {
    color: black;
    width: 38px;
    height: 21px;
    font-size: inherit;
    border: none;
    text-align: center;
    -moz-appearance: textfield;
    background: transparent;
    border-left: 1px solid #767676;
    border-right: 1px solid #767676;
    display: block;
    float: left;
    padding: 0;
    border-radius: 0;
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .cart-item__price {
    line-height: 23px;
    float: right;
    font-weight: bold;
  }

  .cart-bottom {
    border-top: 1px solid #e5e5e5;
  }

  .cart-info {
    padding: 15px 20px 10px;
  }

  .cart-info__total {
    float: left;
    text-transform: uppercase;
  }

  .cart-info__small {
    font-size: 11px;
  }

  .cart-info__pricing {
    float: right;
  }

  .cart-discount-notice {
    // color: $color-title;
    margin-bottom: 10px;
  }

  .cart-actions-container {
    padding-top: 5px;
  }

  .pricing {
    margin-left: 5px;
    font-size: 16px;
    color: black;
  }
</style>
