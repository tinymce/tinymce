import { Cell, Fun, Option } from '@ephox/katamari';

import { BehaviourState, nuState } from '../common/BehaviourState';
import { FlatgridState } from '../../keying/KeyingModeTypes';

const flatgrid = (spec): FlatgridState => {
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
    readState: () => {
      return dimensions.get().map((d) => {
        return {
          numRows: d.numRows(),
          numColumns: d.numColumns()
        }
      }).getOr({
        numRows: '?',
        numColumns: '?'
      })
    },
    setGridSize,
    getNumRows,
    getNumColumns
  }) as FlatgridState;
};

const init = (spec) => {
  return spec.state(spec);
};

export {
  flatgrid,
  init
};