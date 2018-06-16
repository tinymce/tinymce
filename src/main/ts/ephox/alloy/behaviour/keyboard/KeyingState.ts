import { Cell, Fun, Option } from '@ephox/katamari';

import { BehaviourState, nuState } from '../common/BehaviourState';

const flatgrid = (spec) => {
  const dimensions = Cell(Option.none());

  const setGridSize = (numRows, numColumns) => {
    dimensions.set(
      Option.some({
        numRows: Fun.constant(numRows),
        numColumns: Fun.constant(numColumns)
      })
    );
  };

  const getNumRows = () => {
    return dimensions.get().map((d) => {
      return d.numRows();
    });
  };

  const getNumColumns = () => {
    return dimensions.get().map((d) => {
      return d.numColumns();
    });
  };

  return nuState({
    readState: Fun.constant({ }),
    setGridSize,
    getNumRows,
    getNumColumns
  });
};

const init = (spec) => {
  return spec.state()(spec);
};

export {
  flatgrid,
  init
};