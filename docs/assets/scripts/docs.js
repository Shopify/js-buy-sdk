$(function() {
  function filterOrderSideNavItem(pageUrl, items) {
    var ORDER = [
      'ShopifyBuy',
      'ShopClient',
      'ProductModel',
      'ProductVariantModel',
      'CartModel',
      'CartLineItemModel'
    ];

    var newItems = ORDER.map(function(key) {
      return items.find(function(docClass) {
        return docClass.name === key;
      });
    })
    .filter(function(value) {
      return value;
    });

    return newItems;
  }

  function getHTMLForSideNavItems(pageUrl, items) {
    return items.map(function(docClass) {
      var activeClass = "";
      if (pageUrl.includes(docClass.url.slice(2))) {
        activeClass = "active";
      }
      return "<li><a href='" + docClass.url + "' class='docs-sub-nav__link " + activeClass + "'>" +
        docClass.name +
        "</a></li>";
    });
  }

  var highlightSubNavItem = function () {
    var pageUrl = window.location.href;
    var indexOfOcto = pageUrl.indexOf('#');
    if (indexOfOcto >= 0) {
      $('.docs-sub-nav__link').removeClass('active');
      var subNavLinkId = pageUrl.slice(indexOfOcto);
      $(subNavLinkId + '-link').addClass('active');
    };
  };
  highlightSubNavItem();

  $(window).bind( 'hashchange', function(e) {
    highlightSubNavItem();
  });


  var generateApiClassNavItems = function () {
    var pageUrl = window.location.href;
    var items = window.YUIDocs.classes.slice();
    items = filterOrderSideNavItem(pageUrl, items);
    items = getHTMLForSideNavItems(pageUrl, items);

    var html = "<ul class='docs-sub-nav'>" + items.join('') + "</ul>";
    $('.nav-item--reference').append(html);
  };
  if (window.YUIDocs) {
    generateApiClassNavItems();
  }

  if(document.queryCommandSupported('copy')) {
    var clipboard = new Clipboard('[data-clipboard-text]');
    clipboard.on('success', function(e) {
      var previousText = $(e.trigger).text();
      $(e.trigger).text('Copied!');
      setTimeout(function() {
        $(e.trigger).text(previousText);
      }, 2000);
    });
    clipboard.on('error', function(e) {
      $(e.trigger).text('Press ⌘-C now to copy');
    });
  }
  else {
    $('[data-clipboard-text]').hide();
  }

});
