define(
  'ephox.alloy.alien.ElementFromPoint',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'global!document'
  ],

  function (Option, Element, document) {
    var insideComponent = function (component, x, y) {
      var optElement = Option.from(document.elementFromPoint(x, y)).map(Element.fromDom);
      return optElement.filter(function (tgt) {
        return component.element().dom().contains(tgt.dom());
      });
    };

    return {
      insideComponent: insideComponent
    };
  }
);
