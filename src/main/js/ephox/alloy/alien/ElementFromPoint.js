define(
  'ephox.alloy.alien.ElementFromPoint',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.WindowSelection',
    'global!document'
  ],

  function (Option, Node, Traverse, WindowSelection, document) {
    var insideComponent = function (component, x, y) {
      var win = Traverse.owner(component.element()).dom().defaultView;
      return WindowSelection.getAtPoint(win, x, y).bind(function (rng) {
        var start = rng.start();
        return component.element().dom().contains(start.dom()) ? Option.some(rng.start()) : Option.none();
      }).filter(function (node) {
        var elem = Node.isText(node) ? Traverse.parent(node) : Option.some(node);
        return elem.exists(function (e) {
          var rect = e.dom().getBoundingClientRect();
          return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
      });
    };

    return {
      insideComponent: insideComponent
    };
  }
);
