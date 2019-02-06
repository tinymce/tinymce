import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';
import { Compare } from '@ephox/sugar';

var detect = function (cell) {

  var getIndex = function (getChildren, elem) {
    return getChildren(elem).bind(function (children) {
      return Arr.findIndex(children, function (child) {
        return Compare.eq(child, elem);
      });
    });
  };

  var getRowIndex = Fun.curry(getIndex, TableLookup.neighbourRows);
  var getCellIndex = Fun.curry(getIndex, TableLookup.neighbourCells);

  return getCellIndex(cell).bind(function (colId) {
    return TableLookup.row(cell).bind(getRowIndex).map(function (rowId) {
      return Structs.address(rowId, colId);
    });
  });
};

export default {
  detect: detect
};