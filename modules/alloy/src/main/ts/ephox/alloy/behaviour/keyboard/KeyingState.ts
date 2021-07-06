import { Singleton } from '@ephox/katamari';

import { FlatgridState, GeneralKeyingConfig } from '../../keying/KeyingModeTypes';
import { nuState, Stateless } from '../common/BehaviourState';

interface RowsCols {
  readonly numRows: number;
  readonly numColumns: number;
}

const flatgrid = (): FlatgridState => {
  const dimensions = Singleton.value<RowsCols>();

  const setGridSize = (numRows: number, numColumns: number) => {
    dimensions.set({ numRows, numColumns });
  };

  const getNumRows = () => dimensions.get().map((d) => d.numRows);

  const getNumColumns = () => dimensions.get().map((d) => d.numColumns);

  return nuState({
    readState: () => dimensions.get().map((d) => ({
      numRows: String(d.numRows),
      numColumns: String(d.numColumns)
    })).getOr({
      numRows: '?',
      numColumns: '?'
    }),
    setGridSize,
    getNumRows,
    getNumColumns
  });
};

const init = (spec: GeneralKeyingConfig): Stateless | FlatgridState =>
  spec.state(spec);

export {
  flatgrid,
  init
};
