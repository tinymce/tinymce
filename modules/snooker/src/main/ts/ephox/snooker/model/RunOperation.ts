import { Arr, Fun, Merger, Option, Options } from '@ephox/katamari';
import { Compare, Traverse } from '@ephox/sugar';
import Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';
import Redraw from '../operate/Redraw';
import BarPositions from '../resize/BarPositions';
import Bars from '../resize/Bars';
import DetailsList from './DetailsList';
import Transitions from './Transitions';
import Warehouse from './Warehouse';

const fromWarehouse = function (warehouse, generators) {
  return Transitions.toGrid(warehouse, generators, false);
};

const deriveRows = function (rendered, generators) {
  // The row is either going to be a new row, or the row of any of the cells.
  const findRow = function (details): any {
    const rowOfCells = Options.findMap(details, function (detail: any) {
      return Traverse.parent(detail.element()).map(function (row) {
        // If the row has a parent, it's within the existing table, otherwise it's a copied row
        const isNew = Traverse.parent(row).isNone();
        return Structs.elementnew(row, isNew);
      });
    });
    return rowOfCells.getOrThunk(function () {
      return Structs.elementnew(generators.row(), true);
    });
  };

  return Arr.map(rendered, function (details) {
    const row = findRow(details.details());
    return Structs.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
  });
};

const toDetailList = function (grid, generators) {
  const rendered = Transitions.toDetails(grid, Compare.eq);
  return deriveRows(rendered, generators);
};

const findInWarehouse = function (warehouse, element) {
  const all = Arr.flatten(Arr.map(warehouse.all(), function (r) { return r.cells(); }));
  return Arr.find(all, function (e) {
    return Compare.eq(element, e.element());
  });
};

const run = function (operation, extract, adjustment, postAction, genWrappers) {
  return function (wire, table, target, generators, direction) {
    const input = DetailsList.fromTable(table);
    const warehouse = Warehouse.generate(input);
    const output = extract(warehouse, target).map(function (info) {
      const model = fromWarehouse(warehouse, generators);
      const result = operation(model, info, Compare.eq, genWrappers(generators));
      const grid = toDetailList(result.grid(), generators);
      return {
        grid: Fun.constant(grid),
        cursor: result.cursor
      };
    });

    return output.fold(function () {
      return Option.none();
    }, function (out) {
      const newElements = Redraw.render(table, out.grid());
      adjustment(table, out.grid(), direction);
      postAction(table);
      Bars.refresh(wire, table, BarPositions.height, direction);
      return Option.some({
        cursor: out.cursor,
        newRows: newElements.newRows,
        newCells: newElements.newCells
      });
    });
  };
};

const onCell = function (warehouse, target) {
  return TableLookup.cell(target.element()).bind(function (cell) {
    return findInWarehouse(warehouse, cell);
  });
};

const onPaste = function (warehouse, target) {
  return TableLookup.cell(target.element()).bind(function (cell) {
    return findInWarehouse(warehouse, cell).map(function (details) {
      return Merger.merge(details, {
        generators: target.generators,
        clipboard: target.clipboard
      });
    });
  });
};

const onPasteRows = function (warehouse, target) {
  const details = Arr.map(target.selection(), function (cell) {
    return TableLookup.cell(cell).bind(function (lc) {
      return findInWarehouse(warehouse, lc);
    });
  });
  const cells = Options.cat(details);
  return cells.length > 0 ? Option.some(Merger.merge({cells}, {
    generators: target.generators,
    clipboard: target.clipboard
  })) : Option.none();
};

const onMergable = function (warehouse, target) {
  return target.mergable();
};

const onUnmergable = function (warehouse, target) {
  return target.unmergable();
};

const onCells = function (warehouse, target) {
  const details = Arr.map(target.selection(), function (cell) {
    return TableLookup.cell(cell).bind(function (lc) {
      return findInWarehouse(warehouse, lc);
    });
  });
  const cells = Options.cat(details);
  return cells.length > 0 ? Option.some(cells) : Option.none();
};

export default {
  run,
  toDetailList,
  onCell,
  onCells,
  onPaste,
  onPasteRows,
  onMergable,
  onUnmergable
};