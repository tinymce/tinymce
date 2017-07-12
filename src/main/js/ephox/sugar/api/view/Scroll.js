define(
  'ephox.sugar.api.view.Scroll',

  [
    'ephox.katamari.api.Type',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Position',
    'global!document'
  ],

  function (Type, PlatformDetection, Location, Position, document) {
    var isSafari = PlatformDetection.detect().browser.isSafari();

    var get = function (_doc) {
      var doc = _doc !== undefined ? _doc.dom() : document;

      // ASSUMPTION: This is for cross-browser support. The doc.body.scrollLeft reports 0 in FF in standards mode,
      // so you need to use the document element. The body works for Chrome, IE (?) and FF in Quirks mode.
      var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
      var y = doc.body.scrollTop || doc.documentElement.scrollTop;
      return Position(x, y);
    };

    var setToElement = function (win, element) {
      var location = Location.absolute(element);
      win.scrollTo(location.left(), location.top());
    };


    // CLIPPY: It looks like you're trying to write a Scroll library :)
    //
    // If this is actually required, just browse the JQuery codebase. That's all I did for the other modules.
    // Looks like it's using window.pageXOffset, window.pageYOffset, and win.scrollTo().

    // var top = function (element) {
    //   $(element.dom()).scrollTop(0);
    // };

    // var bottom = function (element) {

    // };

    // var left = function (element) {

    // };

    // var right = function (element) {

    // };

    // var fromTop = function (element, v) {

    // };

    // var fromLeft = function (element, v) {

    // };

    // TBIO-4472 Safari 10 - Scrolling typeahead with keyboard scrolls page
    var intoView = function (element, alignToTop) {
      if (isSafari && Type.isFunction(element.dom().scrollIntoViewIfNeeded)) {
        element.dom().scrollIntoViewIfNeeded(false); // false=align to nearest edge
      } else {
        element.dom().scrollIntoView(alignToTop); // true=to top, false=to bottom
      }
    };

    // If the element is above the container, or below the container, then scroll to the top or bottom
    var intoViewIfNeeded = function (element, container) {
      var containerBox = container.dom().getBoundingClientRect();
      var elementBox = element.dom().getBoundingClientRect();
      if (elementBox.top < containerBox.top) {
        // element top is above the viewport top, scroll so it's at the top
        intoView(element, true);
      } else if (elementBox.bottom > containerBox.bottom) {
        // element bottom is below the viewport bottom, scroll so it's at the bottom
        intoView(element, false);
      }
    }

    return {
      get: get,
      // top: top,
      // bottom: bottom,
      // left: left,
      // right: right,
      // fromTop: fromTop,
      // fromLeft: fromLeft,
      intoView: intoView,
      intoViewIfNeeded: intoViewIfNeeded,
      setToElement: setToElement
    };
  }
);
