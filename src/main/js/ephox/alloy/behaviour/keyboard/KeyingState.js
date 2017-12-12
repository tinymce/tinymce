import BehaviourState from '../common/BehaviourState';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

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

export default <any> {
  flatgrid: flatgrid,
  init: init
};