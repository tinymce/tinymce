define(
  'ephox.sugar.api.view.Location',

  [
    'ephox.sugar.api.dom.Dom',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Position'
  ],

  function (Dom, Element, Css, Position) {
    var boxPosition = function (dom) {
      var box = dom.getBoundingClientRect();
      return Position(box.left, box.top);
    };

    // Avoids falsy false fallthrough
    var firstDefinedOrZero = function (a, b) {
      return a !== undefined ? a :
             b !== undefined ? b :
             0;
    };

    var absolute = function (element) {
      var doc = element.dom().ownerDocument;
      var body = doc.body;
      var win = Dom.windowOf(Element.fromDom(doc));
      var html = doc.documentElement;
      // TBIO-5098 - iframe content scroller moved to body so need to use scrollTop, scrollHeight etc from body (and win.scrollTo() will not work)
      //             NB. body style has: margin:0; box-sizing: border-box;
      var iframeRtlScroller = win.frameElement && Css.getRaw(Element.fromDom(html), 'overflow-y').is('hidden');

      var scrollTop = iframeRtlScroller  ? firstDefinedOrZero(body.scrollTop, undefined)  : firstDefinedOrZero(win.pageYOffset, html.scrollTop);
      var scrollLeft = iframeRtlScroller ? firstDefinedOrZero(body.scrollLeft, undefined) : firstDefinedOrZero(win.pageXOffset, html.scrollLeft);

      var clientTop = iframeRtlScroller  ? firstDefinedOrZero(body.clientTop, undefined)  : firstDefinedOrZero(html.clientTop, body.clientTop);
      var clientLeft = iframeRtlScroller ? firstDefinedOrZero(body.clientLeft, undefined) : firstDefinedOrZero(html.clientLeft, body.clientLeft);

      return viewport(element).translate(
        scrollLeft - clientLeft,
        scrollTop - clientTop);
    };

    // This is the old $.position(), but JQuery does nonsense calculations.
    // We're only 1 <-> 1 with the old value in the single place we use this function
    // (ego.api.Dragging) so the rest can bite me.
    var relative = function (element) {
      var dom = element.dom();
      // jquery-ism: when style="position: fixed", this === boxPosition()
      // but tests reveal it returns the same thing anyway
      return Position(dom.offsetLeft, dom.offsetTop);
    };

    var viewport = function (element) {
      var dom = element.dom();

      var doc = dom.ownerDocument;
      var body = doc.body;
      var html = Element.fromDom(doc.documentElement);

      if (body === dom)
        return Position(body.offsetLeft, body.offsetTop);

      if (!Dom.attached(element, html))
        return Position(0, 0);

      return boxPosition(dom);
    };

    return {
      absolute: absolute,
      relative: relative,
      viewport: viewport
    };
  }
);
