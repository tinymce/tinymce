define(
  'ephox.sugar.api.dom.Link',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'global!document'
  ],

  function (Attr, Element, Insert, document) {
    var addToHead = function (doc, tag) {
      /*
       * IE9 and above per
       * https://developer.mozilla.org/en-US/docs/Web/API/Document/head
       */
      var head = Element.fromDom(doc.dom().head);
      Insert.append(head, tag);
    };

    var addStylesheet = function (url, _scope) {
      var doc = _scope || Element.fromDom(document);

      var link = Element.fromTag('link', doc.dom()); // We really need to fix that Element API

      Attr.setAll(link, {
        rel: 'stylesheet',
        type: 'text/css',
        href: url
      });

      addToHead(doc, link);
      return link;
    };

    return {
      addStylesheet: addStylesheet
    };
  }
);