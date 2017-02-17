define(
  'ephox.alloy.positioning.layout.Boxes',

  [
    'ephox.alloy.positioning.layout.Bounds',
    'ephox.alloy.frame.OuterPosition',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Scroll',
    'ephox.sugar.api.view.Width',
    'global!document',
    'global!window'
  ],

  function (Bounds, OuterPosition, Element, Scroll, Width, document, window) {
    // NOTE: We used to use AriaFocus.preserve here, but there is no reason to do that now that
    // we are not changing the visibility of the element. Hopefully (2015-09-29).
    var absolute = function (element) {
      var position = OuterPosition.find(element);
      var width = Width.getOuter(element);
      var height = Height.getOuter(element);
      return Bounds(position.left(), position.top(), width, height);
    };

    var view = function () {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var doc = Element.fromDom(document);
      var scroll = Scroll.get(doc);
      return Bounds(scroll.left(), scroll.top(), width, height);
    };

    return {
      absolute: absolute,
      view: view
    };
  }
);