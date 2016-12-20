define(
  'ephox.sugar.api.node.Fragment',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'global!document'
  ],

  function (Arr, Element, document) {
    var fromElements = function (elements, scope) {
      var doc = scope || document;
      var fragment = doc.createDocumentFragment();
      Arr.each(elements, function (element) {
        fragment.appendChild(element.dom());
      });
      return Element.fromDom(fragment);
    };

    return {
      fromElements: fromElements
    };
  }
);
