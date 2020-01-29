import { Cell, Fun, Option } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { FlatgridState, GeneralKeyingConfig } from '../../keying/KeyingModeTypes';

interface RowsCols {
  numRows: () => number;
  numColumns: () => number;
}

const flatgrid = (): FlatgridState => {
  const dimensions = Cell(Option.none<RowsCols>());

  const setGridSize = (numRows: number, numColumns: number) => {
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
          numRows: String(d.numRows()),
          numColumns: String(d.numColumns())
        };
      }).getOr({
        numRows: '?',
        numColumns: '?'
      });
    },
    setGridSize,
    getNumRows,
    getNumColumns
  });
};

const init = (spec: GeneralKeyingConfig) => {
  return spec.state(spec);
};

export {
  flatgrid,
  init
};
