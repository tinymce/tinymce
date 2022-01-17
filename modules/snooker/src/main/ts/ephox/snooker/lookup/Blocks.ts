import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { DetailExt } from '../api/Structs';
import { Warehouse } from '../api/Warehouse';

type ValidCellFn = (cell: SugarElement<HTMLTableCellElement>) => boolean;

/*
 * Identify for each column, a cell that has colspan 1. Note, this
 * may actually fail, and future work will be to calculate column
 * sizes that are only available through the difference of two
 * spanning columns.
 */
const columns = (warehouse: Warehouse, isValidCell: ValidCellFn = Fun.always): Optional<SugarElement<HTMLTableCellElement>>[] => {
  const grid = warehouse.grid;
  const cols = Arr.range(grid.columns, Fun.identity);
  const rowsArr = Arr.range(grid.rows, Fun.identity);

  return Arr.map(cols, (col) => {
    const getBlock = () =>
      Arr.bind(rowsArr, (r) =>
        Warehouse.getAt(warehouse, r, col)
          .filter((detail) => detail.column === col)
          .toArray()
      );

    const isValid = (detail: DetailExt) => detail.colspan === 1 && isValidCell(detail.element);
    const getFallback = () => Warehouse.getAt(warehouse, 0, col);
    return decide(getBlock, isValid, getFallback);
  });
};

const decide = (
  getBlock: () => DetailExt[],
  isValid: (detail: DetailExt) => boolean,
  getFallback: () => Optional<DetailExt>
): Optional<SugarElement<HTMLTableCellElement>> => {
  const inBlock = getBlock();
  const validInBlock = Arr.find(inBlock, isValid);
  const detailOption = validInBlock.orThunk(() => Optional.from(inBlock[0]).orThunk(getFallback));
  return detailOption.map((detail) => detail.element);
};

const rows = (warehouse: Warehouse): Optional<SugarElement<HTMLTableCellElement>>[] => {
  const grid = warehouse.grid;
  const rowsArr = Arr.range(grid.rows, Fun.identity);
  const cols = Arr.range(grid.columns, Fun.identity);

  return Arr.map(rowsArr, (row) => {
    const getBlock = () => Arr.bind(cols, (c) => Warehouse.getAt(warehouse, row, c)
      .filter((detail) => detail.row === row)
      .fold(Fun.constant([] as DetailExt[]), (detail) => [ detail ])
    );

    const isSingle = (detail: DetailExt) => detail.rowspan === 1;
    const getFallback = () => Warehouse.getAt(warehouse, row, 0);
    return decide(getBlock, isSingle, getFallback);
  });

};

export { columns, rows };
