define(
  'ephox.snooker.lookup.TagLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Fun, Structs, Compare, SelectorFilter, SelectorFind, Traverse) {
    var detect = function (cell) {
      var getIndex = function (selector, elem) {
        return Traverse.parent(elem).map(function (parent) {
          var children = SelectorFilter.children(parent, selector);
          return Arr.findIndex(children, function (child) {
            return Compare.eq(child, elem);
          });
        });
      };

      var getRowIndex = Fun.curry(getIndex, 'tr');
      var getCellIndex = Fun.curry(getIndex, 'td,th');

      return getCellIndex(cell).bind(function (colId) {
        return SelectorFind.ancestor(cell, 'tr').bind(getRowIndex).map(function (rowId) {
          return Structs.address(rowId, colId);
        });
      });
    };

    return {
      detect: detect
    };
  }
);
