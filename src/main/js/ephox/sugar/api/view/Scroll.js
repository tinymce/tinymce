define(
  'ephox.sugar.api.view.Scroll',

  [
    'ephox.sugar.api.view.Position',
    'ephox.sugar.api.view.Location',
    'global!document'
  ],

  function (Position, Location, document) {
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

    // var intoView = function (element) {

    // };

    return {
      get: get,
      // top: top,
      // bottom: bottom,
      // left: left,
      // right: right,
      // fromTop: fromTop,
      // fromLeft: fromLeft,
      // intoView: intoView,
      setToElement: setToElement
    };
  }
);
