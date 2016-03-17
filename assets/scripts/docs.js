$(function() {

  var highlightSubNavItem = function () {
    var pageUrl = window.location.href;
    var indexOfOcto = pageUrl.indexOf('#');
    if (indexOfOcto >= 0) {
      $('.docs-sub-nav__link').removeClass('active');
      var subNavLinkId = pageUrl.slice(indexOfOcto);
      $(subNavLinkId + '-link').addClass('active');
    }
  }
  highlightSubNavItem();

  $(window).bind( 'hashchange', function(e) {
    highlightSubNavItem();
  });

});
