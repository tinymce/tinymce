define(
  'ephox.snooker.ready.lookup.TagLookup',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Compare, SelectorFind, Traverse) {
    var detect = function (cell) {
      var getIndex = function (elem) {
        return Traverse.parent(elem).map(function (parent) {
          var children = Traverse.children(parent);
          return Arr.findIndex(children, function (child) {
            return Compare.eq(child, elem);
          });
        });
      };

      return getIndex(cell).bind(function (colId) {
        return SelectorFind.ancestor(cell, 'tr').bind(getIndex).map(function (rowId) {
          return grid(rowId, colId);
        });
      });
    };

    return {
      detect: detect
    };
  }
);
