define(
  'ephox.alloy.behaviour.keyboard.KeyingState',

  [
    'ephox.alloy.behaviour.common.BehaviourState',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (BehaviourState, Cell, Fun, Option) {
    var flatgrid = function (spec) {
      var dimensions = Cell(Option.none());
      
      var setGridSize = function (numRows, numColumns) {
        dimensions.set(
          Option.some({
            numRows: Fun.constant(numRows),
            numColumns: Fun.constant(numColumns)
          })
        );
      };

      var getNumRows = function () {
        return dimensions.get().map(function (d) {
          return d.numRows();
        });
      };

      var getNumColumns = function () {
        return dimensions.get().map(function (d) {
          return d.numColumns();
        });
      };

      return BehaviourState({
        readState: Fun.constant({ }),
        setGridSize: setGridSize,
        getNumRows: getNumRows,
        getNumColumns: getNumColumns
      });
    };

    var init = function (spec) {
      return spec.state()(spec);
    };

    return {
      flatgrid: flatgrid,
      init: init
    };
  }
);
