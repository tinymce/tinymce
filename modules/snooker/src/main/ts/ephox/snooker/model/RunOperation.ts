import { HTMLTableElement } from '@ephox/dom-globals';
import { Arr, Fun, Option, Options } from '@ephox/katamari';
import { Compare, Element, Traverse } from '@ephox/sugar';
import { Generators, GeneratorsWrapper, SimpleGenerators } from '../api/Generators';
import { ResizeWire } from '../api/ResizeWire';
import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { TableOperationResult } from '../api/TableOperations';
import { TableSize } from '../api/TableSize';
import * as Redraw from '../operate/Redraw';
import * as BarPositions from '../resize/BarPositions';
import * as Bars from '../resize/Bars';
import * as Transitions from './Transitions';
import { Warehouse } from './Warehouse';

type DetailExt = Structs.DetailExt;
type DetailNew = Structs.DetailNew;
type RowDataNew<A> = Structs.RowDataNew<A>;
type ColInfo = BarPositions.ColInfo;
type BarPositions<A> = BarPositions.BarPositions<A>;

export interface RunOperationOutput {
  readonly cursor: () => Option<Element>;
  readonly newRows: () => Element[];
  readonly newCells: () => Element[];
}

export interface TargetElement {
  readonly element: () => Element;
}

export interface TargetSelection {
  readonly selection: () => Element[];
}

export interface TargetMergable {
  readonly mergable: () => Option<ExtractMergable>;
}

export interface TargetUnmergable {
  readonly unmergable: () => Option<Element[]>;
}

// combines the above 4 interfaces because this is what data we actually get from TinyMCE
export interface CombinedTargets extends TargetElement, TargetSelection, TargetMergable, TargetUnmergable { };

export interface TargetPaste {
  readonly element: () => Element;
  readonly generators: () => SimpleGenerators;
  readonly clipboard: () => Element;
}

export interface TargetPasteRows {
  readonly selection: () => Element[];
  readonly generators: () => SimpleGenerators;
  readonly clipboard: () => Element[];
}

export interface ExtractMergable {
  readonly cells: () => Element[];
  readonly bounds: () => Structs.Bounds;
}

export interface ExtractPaste extends Structs.DetailExt {
  readonly generators: () => SimpleGenerators;
  readonly clipboard: () => Element;
}

export interface ExtractPasteRows {
  readonly cells: Structs.DetailExt[];
  readonly generators: () => SimpleGenerators;
  readonly clipboard: () => Element[];
}

const fromWarehouse = (warehouse: Warehouse, generators: Generators) =>
  Transitions.toGrid(warehouse, generators, false);

const deriveRows = (rendered: Structs.RowDetails[], generators: Generators) => {
  // The row is either going to be a new row, or the row of any of the cells.
  const findRow = (details: Structs.DetailNew[]) => {
    const rowOfCells = Arr.findMap(details, (detail) => Traverse.parent(detail.element()).map((row) => {
      // If the row has a parent, it's within the existing table, otherwise it's a copied row
      const isNew = Traverse.parent(row).isNone();
      return Structs.elementnew(row, isNew);
    }));
    return rowOfCells.getOrThunk(() => Structs.elementnew(generators.row(), true));
  };

  return Arr.map(rendered, (details) => {
    const row = findRow(details.details());
    return Structs.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
  });
};

const toDetailList = (grid: Structs.RowCells[], generators: Generators): RowDataNew<DetailNew>[] => {
  const rendered = Transitions.toDetails(grid, Compare.eq);
  return deriveRows(rendered, generators);
};

const findInWarehouse = (warehouse: Warehouse, element: Element): Option<DetailExt> => Arr.findMap(warehouse.all, (r) =>
  Arr.find(r.cells(), (e) => Compare.eq(element, e.element()))
);

type EqEle = (e1: Element, e2: Element) => boolean;
type Operation<INFO, GW extends GeneratorsWrapper> = (model: Structs.RowCells[], info: INFO, eq: EqEle, w: GW) => TableOperationResult;
type Extract<RAW, INFO> = (warehouse: Warehouse, target: RAW) => Option<INFO>;
type Adjustment = <T extends Structs.DetailNew>(table: Element, grid: Structs.RowDataNew<T>[], direction: BarPositions<ColInfo>, tableSize: TableSize) => void;
type PostAction = (e: Element) => void;
type GenWrap<GW extends GeneratorsWrapper> = (g: Generators) => GW;

export type OperationCallback<T> = (wire: ResizeWire, table: Element<HTMLTableElement>, target: T, generators: Generators, direction: BarPositions<ColInfo>, sizing?: TableSize) => Option<RunOperationOutput>;

const run = <RAW, INFO, GW extends GeneratorsWrapper>
(operation: Operation<INFO, GW>, extract: Extract<RAW, INFO>, adjustment: Adjustment, postAction: PostAction, genWrappers: GenWrap<GW>): OperationCallback<RAW> =>
  (wire: ResizeWire, table: Element, target: RAW, generators: Generators, direction: BarPositions<ColInfo>, sizing?: TableSize): Option<RunOperationOutput> => {
    const warehouse = Warehouse.fromTable(table);
    const output = extract(warehouse, target).map((info) => {
      const model = fromWarehouse(warehouse, generators);
      const result = operation(model, info, Compare.eq, genWrappers(generators));
      const grid = toDetailList(result.grid(), generators);
      return {
        grid: Fun.constant(grid),
        cursor: result.cursor
      };
    });

    return output.fold(() => Option.none<RunOperationOutput>(), (out) => {
      const newElements = Redraw.render(table, out.grid());
      const tableSizing = Option.from(sizing).getOrThunk(() => TableSize.getTableSize(table));
      adjustment(table, out.grid(), direction, tableSizing);
      postAction(table);
      Bars.refresh(wire, table, BarPositions.height, direction);
      return Option.some({
        cursor: out.cursor,
        newRows: Fun.constant(newElements.newRows),
        newCells: Fun.constant(newElements.newCells)
      });
    });
  };

const onCell = (warehouse: Warehouse, target: TargetElement): Option<DetailExt> => TableLookup.cell(target.element()).bind((cell) => findInWarehouse(warehouse, cell));

const onPaste = (warehouse: Warehouse, target: TargetPaste): Option<ExtractPaste> => TableLookup.cell(target.element()).bind((cell) => findInWarehouse(warehouse, cell).map((details) => {
  const value: ExtractPaste = {
    ...details,
    generators: target.generators,
    clipboard: target.clipboard
  };
  return value;
}));

const onPasteByEditor = (warehouse: Warehouse, target: TargetPasteRows): Option<ExtractPasteRows> => {
  const details = Arr.map(target.selection(), (cell) => TableLookup.cell(cell).bind((lc) => findInWarehouse(warehouse, lc)));
  const cells = Options.cat(details);
  return cells.length > 0 ? Option.some(
    {
      cells,
      generators: target.generators,
      clipboard: target.clipboard
    }
  ) : Option.none();
};

const onMergable = (_warehouse: Warehouse, target: TargetMergable): Option<ExtractMergable> =>
  target.mergable();

const onUnmergable = (_warehouse: Warehouse, target: TargetUnmergable): Option<Element[]> =>
  target.unmergable();

const onCells = (warehouse: Warehouse, target: TargetSelection): Option<DetailExt[]> => {
  const details = Arr.map(target.selection(), (cell) => TableLookup.cell(cell).bind((lc) => findInWarehouse(warehouse, lc)));
  const cells = Options.cat(details);
  return cells.length > 0 ? Option.some(cells) : Option.none();
};

export {
  run,
  toDetailList,
  onCell,
  onCells,
  onPaste,
  onPasteByEditor,
  onMergable,
  onUnmergable
};
