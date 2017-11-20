define(
  'ephox.sugar.api.view.ElementFromPoint',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element'
  ],

  function (Option, Element) {
    var elementFromPoint = function (win, x, y) {
      return Option.from(win.document.elementFromPoint(x, y)).map(Element.fromDom);
    };

    return {
      elementFromPoint: elementFromPoint
    };
  }
);
