import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { Compare, Traverse, Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import TableLookup from '../api/TableLookup';
import Redraw from '../operate/Redraw';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import Bars from '../resize/Bars';
import DetailsList from './DetailsList';
import Transitions from './Transitions';
import { Warehouse } from './Warehouse';
import { Generators, GeneratorsWrapper, SimpleGenerators } from '../api/Generators';
import { ResizeWire } from '../api/ResizeWire';
import { TableOperationResult } from '../api/TableOperations';

export interface RunOperationOutput {
  cursor: () => Option<Element>;
  newRows: () => Element[];
  newCells: () => Element[];
}

export interface TargetElement {
  element: () => Element;
}

export interface TargetSelection {
  selection: () => Element[];
}

export interface TargetMergable {
  mergable: () => Option<ExtractMergable>;
}

export interface TargetUnmergable {
  unmergable: () => Option<Element[]>;
}

export interface TargetPaste {
  element: () => Element;
  generators: () => SimpleGenerators;
  clipboard: () => Element;
}

export interface TargetPasteRows {
  selection: () => Element[];
  generators: () => SimpleGenerators;
  clipboard: () => Element[];
}

export interface ExtractMergable {
  cells: () => Element[];
  bounds: () => Structs.Bounds;
}

export interface ExtractPaste extends Structs.DetailExt {
  generators: () => SimpleGenerators;
  clipboard: () => Element;
}

export interface ExtractPasteRows {
  cells: Structs.DetailExt[];
  generators: () => SimpleGenerators;
  clipboard: () => Element[];
}

const fromWarehouse = function (warehouse: Warehouse, generators: Generators) {
  return Transitions.toGrid(warehouse, generators, false);
};

const deriveRows = function (rendered: Structs.RowDetails[], generators: Generators) {
  // The row is either going to be a new row, or the row of any of the cells.
  const findRow = function (details: Structs.DetailNew[]) {
    const rowOfCells = Options.findMap(details, function (detail) {
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

const toDetailList = function (grid: Structs.RowCells[], generators: Generators) {
  const rendered = Transitions.toDetails(grid, Compare.eq);
  return deriveRows(rendered, generators);
};

const findInWarehouse = function (warehouse: Warehouse, element: Element) {
  const all = Arr.flatten(Arr.map(warehouse.all(), function (r) { return r.cells(); }));
  return Arr.find(all, function (e) {
    return Compare.eq(element, e.element());
  });
};

type EqEle = (e1: Element, e2: Element) => boolean;
type Operation<INFO, GW extends GeneratorsWrapper> = (model: Structs.RowCells[], info: INFO, eq: EqEle, w: GW) => TableOperationResult;
type Extract<RAW, INFO> = (warehouse: Warehouse, target: RAW) => Option<INFO>;
type Adjustment = <T extends Structs.DetailNew>(table: Element, grid: Structs.RowDataNew<T>[], direction: BarPositions<ColInfo>) => void;
type PostAction = (e: Element) => void;
type GenWrap<GW extends GeneratorsWrapper> = (g: Generators) => GW;

const run = function <RAW, INFO, GW extends GeneratorsWrapper> (operation: Operation<INFO, GW>, extract: Extract<RAW, INFO>, adjustment: Adjustment, postAction: PostAction, genWrappers: GenWrap<GW>) {
  return function (wire: ResizeWire, table: Element, target: RAW, generators: Generators, direction: BarPositions<ColInfo>): Option<RunOperationOutput> {
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
      return Option.none<RunOperationOutput>();
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

const onCell = function (warehouse: Warehouse, target: TargetElement) {
  return TableLookup.cell(target.element()).bind(function (cell) {
    return findInWarehouse(warehouse, cell);
  });
};

const onPaste = function (warehouse: Warehouse, target: TargetPaste): Option<ExtractPaste> {
  return TableLookup.cell(target.element()).bind(function (cell) {
    return findInWarehouse(warehouse, cell).map(function (details) {
      const value: ExtractPaste = {
        ...details,
        generators: target.generators,
        clipboard: target.clipboard
      };
      return value;
    });
  });
};

const onPasteRows = function (warehouse: Warehouse, target: TargetPasteRows): Option<ExtractPasteRows> {
  const details = Arr.map(target.selection(), function (cell) {
    return TableLookup.cell(cell).bind(function (lc) {
      return findInWarehouse(warehouse, lc);
    });
  });
  const cells = Options.cat(details);
  return cells.length > 0 ? Option.some(
    {
      cells,
      generators: target.generators,
      clipboard: target.clipboard
    }
  ) : Option.none();
};

const onMergable = function (_warehouse: Warehouse, target: TargetMergable) {
  return target.mergable();
};

const onUnmergable = function (_warehouse: Warehouse, target: TargetUnmergable) {
  return target.unmergable();
};

const onCells = function (warehouse: Warehouse, target: TargetSelection) {
  const details = Arr.map(target.selection(), function (cell) {
    return TableLookup.cell(cell).bind(function (lc) {
      return findInWarehouse(warehouse, lc);
    });
  });
  const cells = Options.cat(details);
  return cells.length > 0 ? Option.some(cells) : Option.none<Structs.DetailExt[]>();
};

export {
  run,
  toDetailList,
  onCell,
  onCells,
  onPaste,
  onPasteRows,
  onMergable,
  onUnmergable
};