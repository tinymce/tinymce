import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';

const detect = function (cell: Element) {

  const getIndex = function (getChildren: (parent: Element) => Option<Element[]>, elem: Element) {
    return getChildren(elem).bind(function (children) {
      return Arr.findIndex(children, function (child) {
        return Compare.eq(child, elem);
      });
    });
  };

  const getRowIndex = Fun.curry(getIndex, TableLookup.neighbourRows);
  const getCellIndex = Fun.curry(getIndex, TableLookup.neighbourCells);

  return getCellIndex(cell).bind(function (colIdx: number) {
    return TableLookup.row(cell).bind(getRowIndex).map(function (rowIdx: number) {
      return Structs.address(rowIdx, colIdx);
    });
  });
};

export default {
  detect
};