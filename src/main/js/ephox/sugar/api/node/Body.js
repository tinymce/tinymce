define(
  'ephox.sugar.api.node.Body',

  [
    'ephox.katamari.api.Thunk',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'global!document'
  ],

  function (Thunk, Element, Node, document) {

    // Node.contains() is very, very, very good performance
    // http://jsperf.com/closest-vs-contains/5
    var inBody = function (element) {
      // Technically this is only required on IE, where contains() returns false for text nodes.
      // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
      var dom = Node.isText(element) ? element.dom().parentNode : element.dom();

      // use ownerDocument.body to ensure this works inside iframes.
      // Normally contains is bad because an element "contains" itself, but here we want that.
      return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
    };

    var body = Thunk.cached(function() {
      return getBody(Element.fromDom(document));
    });

    var getBody = function (doc) {
      var body = doc.dom().body;
      if (body === null || body === undefined) throw 'Body is not available yet';
      return Element.fromDom(body);
    };

    return {
      body: body,
      getBody: getBody,
      inBody: inBody
    };
  }
);
