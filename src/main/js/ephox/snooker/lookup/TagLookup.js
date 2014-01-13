define(
  'ephox.snooker.lookup.TagLookup',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Structs, TableLookup, Compare) {
    var detect = function (cell) {

      var getIndex = function (getChildren, elem) {
        return getChildren(elem).map(function (children) {
          return Arr.findIndex(children, function (child) {
            return Compare.eq(child, elem);
          });
        });
      };

      var getRowIndex = Fun.curry(getIndex, TableLookup.neighbourRows);
      var getCellIndex = Fun.curry(getIndex, TableLookup.neighbourCells);

      return getCellIndex(cell).bind(function (colId) {
        return TableLookup.row(cell).bind(getRowIndex).map(function (rowId) {
          return Structs.address(rowId, colId);
        });
      });
    };

    return {
      detect: detect
    };
  }
);
