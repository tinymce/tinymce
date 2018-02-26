import { Cell, Fun, Option } from '@ephox/katamari';

import BehaviourState from '../common/BehaviourState';

const flatgrid = function (spec) {
  const dimensions = Cell(Option.none());

  const setGridSize = function (numRows, numColumns) {
    dimensions.set(
      Option.some({
        numRows: Fun.constant(numRows),
        numColumns: Fun.constant(numColumns)
      })
    );
  };

  const getNumRows = function () {
    return dimensions.get().map(function (d) {
      return d.numRows();
    });
  };

  const getNumColumns = function () {
    return dimensions.get().map(function (d) {
      return d.numColumns();
    });
  };

  return BehaviourState({
    readState: Fun.constant({ }),
    setGridSize,
    getNumRows,
    getNumColumns
  });
};

const init = function (spec) {
  return spec.state()(spec);
};

export {
  flatgrid,
  init
};