define(
  'ephox.alloy.alien.ElementFromPoint',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.WindowSelection',
    'global!document'
  ],

  function (Option, Traverse, WindowSelection, document) {
    var insideComponent = function (component, x, y) {
      var win = Traverse.owner(component.element()).dom().defaultView;
      return WindowSelection.getAtPoint(win, x, y).bind(function (rng) {
        var start = rng.start();
        return component.element().dom().contains(start.dom()) ? Option.some(rng.start()) : Option.none();
      });
    };

    return {
      insideComponent: insideComponent
    };
  }
);
