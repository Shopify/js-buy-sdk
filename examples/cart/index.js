$(function() {

  var client = ShopifyBuy.buildClient({
    apiKey: 'ca868abf6acdf2633621a6e379b606f5',
    myShopifyDomain: 'buckets-o-stuff',
    channelId: '40889985'
  });

  var checkout;

  client.create('checkouts').then(function (newCheckout) {
    checkout = newCheckout;
  });

  function findVariantImage(images, variantId) {
    var primary = images[0];

    var image = images.find(function (image) {
      image.variant_ids.includes(variantId);
    });

    return image || primary;
  }

  function addVariantToCart(variant) {
    checkout.attrs.line_items.push({
      variant_id: variant.id,
      quantity: 1
    });

    client.update('checkouts', checkout).then(function (newCheckout) {
      checkout = newCheckout;

      alert('success');
    }).catch(function (errors) {
      alert('fail');
      errors.response.json().then(function (realErrors) {
        console.log(realErrors);
      });
    });
  }

  client.fetchProduct('3677189889').then(function (product) {
    var variant = product.attrs.variants[0];
    var images = product.attrs.images;

    var image = findVariantImage(images, variant.id);

    var root = $('#buy-button-1');

    $('.variant-image', root).attr('src', image.src);
    $('.product-title', root).text(product.attrs.title);
    $('.variant-title', root).text(variant.title);

    $('.buy-button', root).on('click', function (event) {
      addVariantToCart(variant);
    });
  });
});
