$(function() {

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
    var items = window.YUIDocs.classes.map(function(docClass){
      var activeClass = "";
      if (pageUrl.includes(docClass.url.slice(2))) {
        activeClass = "active";
      }
      return "<li><a href='" +
        docClass.url +
        "' class='docs-sub-nav__link " +
        activeClass +
        "'>" +
        docClass.name +
        "</a></li>"
    });


    var html = "<ul class='docs-sub-nav'>" + items.join('') + "</ul>";
    $('.nav-item--reference').append(html);
  };
  if (window.YUIDocs) {
    generateApiClassNavItems();
  }

  $('.copy-button').on('click', function(e) {
    e.preventDefault();
    $(this).text('Copied!');
  });

});
