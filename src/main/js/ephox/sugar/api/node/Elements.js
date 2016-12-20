define(
  'ephox.sugar.api.node.Elements',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Traverse',
    'global!document'
  ],

  function (Arr, Element, Traverse, document) {
    var fromHtml = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      return Traverse.children(Element.fromDom(div));
    };

    var fromTags = function (tags, scope) {
      return Arr.map(tags, function (x) {
        return Element.fromTag(x, scope);
      });
    };

    var fromText = function (texts, scope) {
      return Arr.map(texts, function (x) {
        return Element.fromText(x, scope);
      });
    };

    var fromDom = function (nodes) {
      return Arr.map(nodes, Element.fromDom);
    };

    return {
      fromHtml: fromHtml,
      fromTags: fromTags,
      fromText: fromText,
      fromDom: fromDom
    };
  }
);
