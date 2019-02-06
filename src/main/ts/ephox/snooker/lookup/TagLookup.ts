import { Arr, Fun } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';

const detect = function (cell) {

  const getIndex = function (getChildren, elem) {
    return getChildren(elem).bind(function (children) {
      return Arr.findIndex(children, function (child) {
        return Compare.eq(child, elem);
      });
    });
  };

  const getRowIndex = Fun.curry(getIndex, TableLookup.neighbourRows);
  const getCellIndex = Fun.curry(getIndex, TableLookup.neighbourCells);

  return getCellIndex(cell).bind(function (colId) {
    return TableLookup.row(cell).bind(getRowIndex).map(function (rowId) {
      return Structs.address(rowId, colId);
    });
  });
};

export default {
  detect
};