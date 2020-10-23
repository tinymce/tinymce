import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Compare, SugarElement, Traverse } from '@ephox/sugar';
import { Generators, GeneratorsWrapper, SimpleGenerators } from '../api/Generators';
import { ResizeWire } from '../api/ResizeWire';
import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { TableOperationResult } from '../api/TableOperations';
import { TableSize } from '../api/TableSize';
import * as Redraw from '../operate/Redraw';
import * as Bars from '../resize/Bars';
import { Warehouse } from '../api/Warehouse';
import * as Transitions from './Transitions';

type DetailExt = Structs.DetailExt;
type DetailNew = Structs.DetailNew;
type RowDataNew<A> = Structs.RowDataNew<A>;

export interface RunOperationOutput {
  readonly cursor: Optional<SugarElement>;
  readonly newRows: SugarElement[];
  readonly newCells: SugarElement[];
}

export interface TargetElement {
  readonly element: SugarElement;
}

export interface TargetSelection {
  readonly selection: SugarElement[];
}

export interface TargetMergable {
  readonly mergable: Optional<ExtractMergable>;
}

export interface TargetUnmergable {
  readonly unmergable: Optional<SugarElement[]>;
}

// combines the above 4 interfaces because this is what data we actually get from TinyMCE
export interface CombinedTargets extends TargetElement, TargetSelection, TargetMergable, TargetUnmergable { }

export interface TargetPaste {
  readonly element: SugarElement;
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement;
}

export interface TargetPasteRows {
  readonly selection: SugarElement[];
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement[];
}

export interface ExtractMergable {
  readonly cells: SugarElement[];
  readonly bounds: Structs.Bounds;
}

export interface ExtractPaste extends Structs.DetailExt {
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement;
}

export interface ExtractPasteRows {
  readonly cells: Structs.DetailExt[];
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement[];
}

const fromWarehouse = (warehouse: Warehouse, generators: Generators) =>
  Transitions.toGrid(warehouse, generators, false);

const deriveRows = (rendered: Structs.RowDetails[], generators: Generators) => {
  // The row is either going to be a new row, or the row of any of the cells.
  const findRow = (details: Structs.DetailNew[]) => {
    const rowOfCells = Arr.findMap(details, (detail) => Traverse.parent(detail.element).map((row) => {
      // If the row has a parent, it's within the existing table, otherwise it's a copied row
      const isNew = Traverse.parent(row).isNone();
      return Structs.elementnew(row, isNew);
    }));
    return rowOfCells.getOrThunk(() => Structs.elementnew(generators.row(), true));
  };

  return Arr.map(rendered, (details) => {
    const row = findRow(details.details);
    return Structs.rowdatanew(row.element, details.details, details.section, row.isNew);
  });
};

const toDetailList = (grid: Structs.RowCells[], generators: Generators): RowDataNew<DetailNew>[] => {
  const rendered = Transitions.toDetails(grid, Compare.eq);
  return deriveRows(rendered, generators);
};

const findInWarehouse = (warehouse: Warehouse, element: SugarElement): Optional<DetailExt> => Arr.findMap(warehouse.all, (r) =>
  Arr.find(r.cells, (e) => Compare.eq(element, e.element))
);

type EqEle = (e1: SugarElement, e2: SugarElement) => boolean;
type Operation<INFO, GW extends GeneratorsWrapper> = (model: Structs.RowCells[], info: INFO, eq: EqEle, w: GW) => TableOperationResult;
type Extract<RAW, INFO> = (warehouse: Warehouse, target: RAW) => Optional<INFO>;
type Adjustment = <T extends Structs.DetailNew>(table: SugarElement, grid: Structs.RowDataNew<T>[], tableSize: TableSize) => void;
type PostAction = (e: SugarElement) => void;
type GenWrap<GW extends GeneratorsWrapper> = (g: Generators) => GW;

export type OperationCallback<T> = (wire: ResizeWire, table: SugarElement<HTMLTableElement>, target: T, generators: Generators, sizing?: TableSize) => Optional<RunOperationOutput>;

const run = <RAW, INFO, GW extends GeneratorsWrapper>
(operation: Operation<INFO, GW>, extract: Extract<RAW, INFO>, adjustment: Adjustment, postAction: PostAction, genWrappers: GenWrap<GW>): OperationCallback<RAW> =>
  (wire: ResizeWire, table: SugarElement, target: RAW, generators: Generators, sizing?: TableSize): Optional<RunOperationOutput> => {
    const warehouse = Warehouse.fromTable(table);
    const output = extract(warehouse, target).map((info) => {
      const model = fromWarehouse(warehouse, generators);
      const result = operation(model, info, Compare.eq, genWrappers(generators));
      const grid = toDetailList(result.grid, generators);
      return {
        grid,
        cursor: result.cursor
      };
    });

    return output.fold(() => Optional.none<RunOperationOutput>(), (out) => {
      const newElements = Redraw.render(table, out.grid);
      const tableSizing = Optional.from(sizing).getOrThunk(() => TableSize.getTableSize(table));
      adjustment(table, out.grid, tableSizing);
      postAction(table);
      Bars.refresh(wire, table);
      return Optional.some({
        cursor: out.cursor,
        newRows: newElements.newRows,
        newCells: newElements.newCells
      });
    });
  };

const onCell = (warehouse: Warehouse, target: TargetElement): Optional<DetailExt> => TableLookup.cell(target.element).bind((cell) => findInWarehouse(warehouse, cell));

const onPaste = (warehouse: Warehouse, target: TargetPaste): Optional<ExtractPaste> => TableLookup.cell(target.element).bind((cell) => findInWarehouse(warehouse, cell).map((details) => {
  const value: ExtractPaste = {
    ...details,
    generators: target.generators,
    clipboard: target.clipboard
  };
  return value;
}));

const onPasteByEditor = (warehouse: Warehouse, target: TargetPasteRows): Optional<ExtractPasteRows> => {
  const details = Arr.map(target.selection, (cell) => TableLookup.cell(cell).bind((lc) => findInWarehouse(warehouse, lc)));
  const cells = Optionals.cat(details);
  return cells.length > 0 ? Optional.some(
    {
      cells,
      generators: target.generators,
      clipboard: target.clipboard
    }
  ) : Optional.none();
};

const onMergable = (_warehouse: Warehouse, target: TargetMergable): Optional<ExtractMergable> =>
  target.mergable;

const onUnmergable = (_warehouse: Warehouse, target: TargetUnmergable): Optional<SugarElement[]> =>
  target.unmergable;

const onCells = (warehouse: Warehouse, target: TargetSelection): Optional<DetailExt[]> => {
  const details = Arr.map(target.selection, (cell) => TableLookup.cell(cell).bind((lc) => findInWarehouse(warehouse, lc)));
  const cells = Optionals.cat(details);
  return cells.length > 0 ? Optional.some(cells) : Optional.none();
};

export { run, toDetailList, onCell, onCells, onPaste, onPasteByEditor, onMergable, onUnmergable };

