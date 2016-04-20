$(function() {

  /* Build new ShopifyBuy client
  ============================================================ */
  var client = ShopifyBuy.buildClient({
    apiKey: 'bf081e860bc9dc1ce0654fdfbc20892d',
    myShopifyDomain: 'embeds',
    appId: '6'
  });

  var cart;
  var cartLineItemCount;
  if(localStorage.getItem('lastCartId')) {
    client.fetchCart(localStorage.getItem('lastCartId')).then(function(remoteCart) {
      cart = remoteCart;
      cartLineItemCount = cart.lineItems.length;
      renderCartItems();
    });
  } else {
    client.createCart().then(function (newCart) {
      cart = newCart;
      localStorage.setItem('lastCartId', cart.id);
      cartLineItemCount = 0;
    });
  }




  /* Fetch product and init
  ============================================================ */
  client.fetchProduct('3614436099').then(function (product) {
    var selectedVariant = product.selectedVariant;
    var selectedVariantImage = product.selectedVariantImage;
    var currentOptions = product.options;

    var variantSelectors = generateSelectors(product);
    $('.variant-selectors').html(variantSelectors);

    updateProductTitle(product.title);
    updateVariantImage(selectedVariantImage);
    updateVariantTitle(selectedVariant);
    updateVariantPrice(selectedVariant);

    attachBuyButtonListeners(product);
    attachOnVariantSelectListeners(product);

    attachQuantityIncrementListeners(product);
    attachQuantityDecrementListeners(product);

    updateCartTabButton();

    attachCheckoutButtonListeners();

    closeCart();

  });

  /* Generate DOM elements for variant selectors
  ============================================================ */
  function generateSelectors(product) {
    var elements = product.options.map(function(option) {
      return '<select name="' + option.name + '">' + option.values.map(function(value) {
        return '<option value="' + value + '">' + value + '</option>';
      }) + '</select>';
    });

    return elements;
  }

  /* Variant option change handler
  ============================================================ */
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
      updateProductTitle(product.title);
      updateVariantImage(selectedVariantImage);
      updateVariantTitle(selectedVariant);
      updateVariantPrice(selectedVariant);
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
    $('#buy-button-1 .variant-image').attr('src', image.src);
  }

  /* Update product variant title based on selected variant
  ============================================================ */
  function updateVariantTitle(variant) {
    $('#buy-button-1 .variant-title').text(variant.title);
  }

  /* Update product variant price based on selected variant
  ============================================================ */
  function updateVariantPrice(variant) {
    $('#buy-button-1 .variant-price').text('$' + variant.price);
  }

  /* Attach and control listeners onto buy button
  ============================================================ */
  function attachBuyButtonListeners(product) {
    $('.buy-button').on('click', function (event) {
      event.preventDefault();
      var id = product.selectedVariant.id;
      addVariantToCart(product.selectedVariant, 1);
      $('#checkout').focus();
    });
  }

  /* Increase product variant quantity in cart
  ============================================================ */
  function attachQuantityIncrementListeners(product) {
    $('.cart').on('click', '.quantity-increment', function() {
      var variantId = parseInt($(this).attr('data-variant-id'), 10);
      var variant = product.variants.filter(function (variant) {
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
      var variant = product.variants.filter(function (variant) {
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

    cart.addVariants({ variant: variant, quantity: quantity }).then(function() {
      renderCartItems();
    }).catch(function (errors) {
      console.log('Fail');
      console.error(errors);
    });

    updateCartTabButton();
  }

  /* Render the line items currently in the cart */
  function renderCartItems() {
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

      if (cartLineItemCount < cart.lineItems.length && (index === cart.lineItems.length - 1)) {
        $lineItemTemplate.addClass('js-hidden');
        cartLineItemCount = cart.lineItems.length;
      }

      if (cartLineItemCount > cart.lineItems.length) {
        cartLineItemCount = cart.lineItems.length;
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
      $('.cart').removeClass('js-active');
    }

    $('.btn--cart-tab').click(function() {
      openCart();
    });
  }

});
