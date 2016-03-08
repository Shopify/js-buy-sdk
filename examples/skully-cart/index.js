$(function() {

  /* Build new ShopifyBuy client
  ============================================================ */
  var client = ShopifyBuy.buildClient({
    apiKey: '444c5595e7070d2969bcc94c191613fb',
    myShopifyDomain: 'skullysystems',
    appId: '6'
  });

  var cart;
  if(localStorage.lastCartId) {
    client.fetchCart(localStorage['lastCartId']).then(function(remoteCart) {
      cart = remoteCart;
      renderCartItems();
    });
  } else {
    client.createCart().then(function (newCart) {
      cart = newCart;
      localStorage.lastCartId = cart.id;
    });
  }

  var lineItemImages = {};

  /* Fetch product and init
  ============================================================ */
  client.fetchProduct('1700705028').then(function (product) {
    var selectedVariant = product.selectedVariant;
    var selectedVariantImage = product.selectedVariantImage;
    var currentOptions = product.options;

    var colorSelectors = generateColorSelectors(product);
    $('#color-picker').html(colorSelectors);
    $('#color-picker').find('input').eq(0).attr('checked', 'checked');

    var sizeSelectors = generateSizeSelectors(product);
    $('#size-picker').append(sizeSelectors);
    $('#size-picker').find('input').eq(0).attr('checked', 'checked');

    updateProductTitle(product.title);
    updateVariantImage(selectedVariantImage);
    updateVariantPrice(selectedVariant);

    attachBuyButtonListeners(product);
    attachOnVariantSelectListeners(product);

    attachQuantityIncrementListeners(product);
    attachQuantityDecrementListeners(product);

    updateCartTabButton();

    attachCheckoutButtonListeners();

    closeCart();


  });

  /* Generate DOM elements for size selectors
  ============================================================ */
  var SIZE_MAPPING = {
    "S": "small",
    "M": "medium",
    "L": "large",
    "XL": "x-large",
    "XXL": "xx-large"
  };

  function generateSizeSelectors(product) {

    var sizeOption = product.options.filter(function (option) {
      return option.name === 'Size';
    })[0];

    var elements = sizeOption.values.map(function(value) {
      return "<div class='col-1-5 " + SIZE_MAPPING[value] + "'>" +
        "<input type='radio' id='" + SIZE_MAPPING[value] + "' name='Size' value='" + value + "'>" +
        "<label for='" + SIZE_MAPPING[value] + "'>" +
          "<div class='sizing'>" +
            "<div class='pictograph'></div>" +
          "</div>" +
          "<p>" +
            value +
          "</p>" +
        "</label>" +
      "</div>"
    });
    return elements;
  }

  /* Generate DOM elements for color selectors
  ============================================================ */
  function generateColorSelectors(product) {
    var colorOption = product.options.filter(function (option) {
      return option.name === 'Color';
    })[0];
    var elements = colorOption.values.map(function(value) {
      var variantWithMatchingColor = product.variants.filter(function(variant) {
        return (variant.optionValues[0].value === value);
      })[0];

      var colorVariantImage = variantWithMatchingColor.image.src;

      var hyphenatedValue = value.split(' ').join('-').toLowerCase();
      return "<div class='col-1-2'>" +
        "<input type='radio' id='" + hyphenatedValue + "' name='Color' class='color' value='" +  value +  "'>" +
        "<label for='" + hyphenatedValue + "'>" +
          "<img class='display-small-hide color-option-image' src='" + colorVariantImage + "'>" +
          "<div class='display-small-only mobile-color-picker-circle'></div>" +
          "<p>" +
            value +
          "</p>" +
        "</label>" +
      "</div>";
    });
    return elements;
  }

  /* Variant option change handler
  ============================================================ */
  function attachOnVariantSelectListeners(product) {
    $('.picker').on('click', 'input', function(event) {
      var $element = $(event.target);
      var name = $element.attr('name');
      var value = $element.val();
      product.options.filter(function(option) {
        return option.name === name;
      })[0].selected = value;

      var selectedVariant = product.selectedVariant;
      var selectedVariantImage = product.selectedVariantImage;
      updateVariantPrice(selectedVariant);
      updateVariantImage(selectedVariantImage);
    });
  }

  /* Update product title
  ============================================================ */
  function updateProductTitle(title) {
    $('#buy-button-1 .product-title').text(title);
  }

  /* Update product image based on selected variant
  ============================================================ */
  function updateVariantImage(image) {
    $('.product-single #helmet_img').attr('src', image.src);
  }

  /* Update product variant title based on selected variant
  ============================================================ */
  function updateVariantTitle(variant) {
    $('#buy-button-1 .variant-title').text(variant.title);
  }

  /* Update product variant price based on selected variant
  ============================================================ */
  function updateVariantPrice(variant) {
    $('.product-single .number.price').text('$' + variant.price);
  }

  /* Attach and control listeners onto buy button
  ============================================================ */
  function attachBuyButtonListeners(product) {
    $('.buy-button').on('click', function (event) {
      event.preventDefault();
      var id = product.selectedVariant.id;
      var image = product.selectedVariant.image.src;
      lineItemImages[id] = image;
      addVariantToCart(product.selectedVariant, 1);
    });
  }

  /* Increase product variant quantity in cart
  ============================================================ */
  function attachQuantityIncrementListeners(product) {
    $('.cart').on('click', '.quantity-increment', function() {
      var variantId = parseInt($(this).attr('data-variant-id'), 10);
      var variant = product.attrs.variants.filter(function (variant) {
        return (variant.id === variantId);
      })[0];

      $(this).closest('.cart-item').addClass('js-working');
      $(this).attr('disabled', 'disabled');

      addVariantToCart(variant, 1);
    });
  }

  /* Decrease product variant quantity in cart
  ============================================================ */
  function attachQuantityDecrementListeners(product) {
    $('.cart').on('click', '.quantity-decrement', function() {
      var variantId = parseInt($(this).attr('data-variant-id'), 10);
      var variant = product.attrs.variants.filter(function (variant) {
        return (variant.id === variantId);
      })[0];

      $(this).closest('.cart-item').addClass('js-working');
      $(this).attr('disabled', 'disabled');

      addVariantToCart(variant, -1);
    });
  }

  /* Open Cart
  ============================================================ */
  function openCart() {
    $('.cart').addClass('js-active');
  }

  /* Close Cart
  ============================================================ */
  function closeCart() {
    $('.cart .btn--close').click(function () {
      $('.cart').removeClass('js-active');
    });
  }

  /* Add 'quantity' amount of product 'variant' to cart
  ============================================================ */
  function addVariantToCart(variant, quantity) {
    openCart();

    var itemExists;
    if (cart.lineItems.length > 0) {
      itemExists = cart.lineItems.filter(function (cartItem) {
        return (cartItem.variant_id === variant.id);
      })[0];
    }

    cart.addVariants({ variant: variant, quantity: quantity }).then(function() {
      renderCartItems(itemExists);
    }).catch(function (errors) {
      console.log("Fail");
      console.error(errors);
    });

    updateCartTabButton();
  }

  /* Render the line items currently in the cart */
  function renderCartItems(itemExists) {
    var $cartItemContainer = $('.cart-item-container');
    var totalPrice = 0;

    $cartItemContainer.empty();
    var lineItemEmptyTemplate = $('#cart-item-template').html();
    var $cartLineItems = cart.lineItems.map(function (lineItem, index) {
      var $lineItemTemplate = $(lineItemEmptyTemplate);
      var itemImage = lineItem.image.src;
      $lineItemTemplate.find('.cart-item__img').css('background-image', 'url(' + itemImage + ')');
      $lineItemTemplate.find('.cart-item__title').text(lineItem.title);
      $lineItemTemplate.find('.cart-item__variant-title').text(lineItem.variant_title);
      $lineItemTemplate.find('.cart-item__price').text(formatAsMoney(lineItem.line_price));
      $lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);
      $lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
      $lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);

      if (itemExists !== undefined && !itemExists && (index === cart.lineItems.length - 1)) {
        $lineItemTemplate.addClass('js-hidden');
      }
      return $lineItemTemplate;
    });
    $cartItemContainer.append($cartLineItems);

    setTimeout(function () {
      $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
    }, 0)

    $('.cart .pricing').text(formatAsMoney(cart.subtotal));
  }

  /* Format amount as currency
  ============================================================ */
  function formatAsMoney(amount) {
    return '$' + parseFloat(amount, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
  }


  /* Checkout listener
  ============================================================ */
  function attachCheckoutButtonListeners() {
    $('.btn--cart-checkout').on('click', function () {
      window.open(cart.checkoutUrl, '_self');
    });
  }

  /* Update cart tab button
  ============================================================ */
  function updateCartTabButton() {
    if (cart.lineItems.length > 0) {
      var totalItems = cart.lineItems.reduce(function(total, item) {
        return total + item.quantity;
      }, 0);
      $('.btn--cart-tab .btn__counter').html(totalItems);
      $('.btn--cart-tab').addClass('js-active');
    } else {
      $('.btn--cart-tab').removeClass('js-active');
    }

    $('.btn--cart-tab').click(function() {
      openCart();
    });
  }

});
