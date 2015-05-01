define(
  'ephox.darwin.api.Beta',

  [
    'ephox.darwin.mouse.CellSelection',
    'ephox.peanut.Fun'
  ],

  function (CellSelection, Fun) {
    var updateSelection = function (rows, columns, container, selected) {
      var update = function (newSels) {
        CellSelection.clear(container);
        CellSelection.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
        return newSels.boxes();
      };

      return CellSelection.shiftSelection(selected, rows, columns).map(update);
    };

    var clearSelection = function (container) {
      console.log('clearing', container);
      CellSelection.clear(container);
    };

    return {
      clearSelection: clearSelection,
      shiftLeft: Fun.curry(updateSelection, 0, -1),
      shiftRight: Fun.curry(updateSelection, 0, +1),
      shiftUp: Fun.curry(updateSelection, -1, 0),
      shiftDown: Fun.curry(updateSelection, +1, 0)
    };
  }
);
