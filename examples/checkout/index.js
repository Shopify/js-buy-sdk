$(function() {

  /* Build new ShopifyBuy client
  ============================================================ */
  var client = ShopifyBuy.buildClient({
    apiKey: 'bf081e860bc9dc1ce0654fdfbc20892d',
    myShopifyDomain: 'embeds',
    appId: '6'
  });

  var product;
  var cart;

  var cartPromise = client.createCart();
  var productPromise = client.fetchProduct('3614436099');
  RSVP.all([cartPromise, productPromise]).then(function (values) {
    cart = values[0];
    product = values[1];
    
    return cart.addVariants(
      {
        variant: product.variants[0], 
        quantity: 5
      }, 
      { 
        variant: product.variants[1], 
        quantity: 3 
      }
    );
  }).then(function () {
    completeUIRendering();
    bindEventListeners();
  }).catch(function (errors) {
    console.info('Something went wrong while preparing the cart');
    console.error(errors);
  });

  /* Update UI variables
  ============================================================ */
  function completeUIRendering() {
    $('.cart .empty').toggle(!cart.lineItemCount);
    $('.cart .not-empty').toggle(cart.lineItemCount !== 0);

    $('.cart .not-empty .sub-total').text(formatAsMoney(cart.subtotal));
    $('.cart .not-empty .line-item-count').text(cart.lineItemCount);
  }

  /* Bind Event Listeners
  ============================================================ */
  function bindEventListeners() {
    $('.cart .not-empty .btn.checkout').on('click', function () {
      var checkoutWindow = window.open(cart.checkoutUrl);
      window.addEventListener("message", checkoutPostMessageListener, checkoutWindow);
    });
  }

  /* Event Listener handles post messages from checkout page
  ============================================================ */
  function checkoutPostMessageListener(event) {
    var origin = event.origin || event.originalEvent.origin;
    if (origin !== 'https://checkout.shopify.com') {
      return;
    }

    var data = JSON.parse(event.data);
    
    if (data.current_checkout_page === '/checkout/thank_you') {
      cart.clearLineItems();
      completeUIRendering();

      // redirect to the home page or to custom thank you page.
    }
  }

  /* Format amount as currency
  ============================================================ */
  function formatAsMoney(amount) {
    return '$' + parseFloat(amount, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
  }

});
