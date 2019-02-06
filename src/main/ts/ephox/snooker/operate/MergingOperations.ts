import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Structs from '../api/Structs';
import GridRow from '../model/GridRow';

// substitution: () -> item
var merge = function (grid, bounds, comparator, substitution) {
  // Mutating. Do we care about the efficiency gain?
  if (grid.length === 0) return grid;
  for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
    for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
      // We can probably simplify this again now that we aren't reusing merge.
      GridRow.mutateCell(grid[i], j, Structs.elementnew(substitution(), false));
    }
  }
  return grid;
};

// substitution: () -> item
var unmerge = function (grid, target, comparator, substitution) {
  // Mutating. Do we care about the efficiency gain?
  var first = true;
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < GridRow.cellLength(grid[0]); j++) {
      var current = GridRow.getCellElement(grid[i], j);
      var isToReplace = comparator(current, target);

      if (isToReplace === true && first === false) {
        GridRow.mutateCell(grid[i], j, Structs.elementnew(substitution(), true));
      }
      else if (isToReplace === true) {
        first = false;
      }
    }
  }
  return grid;
};

var uniqueCells = function (row, comparator) {
  return Arr.foldl(row, function (rest, cell) {
      return Arr.exists(rest, function (currentCell){
        return comparator(currentCell.element(), cell.element());
      }) ? rest : rest.concat([cell]);
  }, []);
};

var splitRows = function (grid, index, comparator, substitution) {
  // We don't need to split rows if we're inserting at the first or last row of the old table
  if (index > 0 && index < grid.length) {
    var rowPrevCells = grid[index - 1].cells();
    var cells = uniqueCells(rowPrevCells, comparator);
    Arr.each(cells, function (cell) {
      // only make a sub when we have to
      var replacement = Option.none();
      for (var i = index; i < grid.length; i++) {
        for (var j = 0; j < GridRow.cellLength(grid[0]); j++) {
          var current = grid[i].cells()[j];
          var isToReplace = comparator(current.element(), cell.element());

          if (isToReplace) {
            if (replacement.isNone()) {
              replacement = Option.some(substitution());
            }
            replacement.each(function (sub) {
              GridRow.mutateCell(grid[i], j, Structs.elementnew(sub, true));
            });
          }
        }
      }
    });
  }

  return grid;
};

export default {
  merge: merge,
  unmerge: unmerge,
  splitRows: splitRows
};