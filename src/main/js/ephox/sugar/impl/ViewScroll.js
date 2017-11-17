define(
  'ephox.sugar.impl.ViewScroll',

  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'global!document'
  ],

  function (Element, Css, document) {
    // True if doc is our our fix for Rtl scrolling of iframe content
    // (TBIO-5098: overflow turned off the HTML, set on BODY for desktop FF, Cr)
    var isIframeBodyScroller = function (doc) {
      var win = doc.defaultView;
      var html = Element.fromDom(doc.documentElement);
      return win.frameElement && Css.getRaw(html, 'overflow').is('hidden');
    };

    return {
      isIframeBodyScroller: isIframeBodyScroller
    };
  }
);
