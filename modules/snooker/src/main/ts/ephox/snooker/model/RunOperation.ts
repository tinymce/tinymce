import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Compare, SugarElement, Traverse } from '@ephox/sugar';
import { Generators, GeneratorsWrapper, SimpleGenerators } from '../api/Generators';
import * as ResizeBehaviour from '../api/ResizeBehaviour';
import { ResizeWire } from '../api/ResizeWire';
import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { TableOperationResult } from '../api/TableOperations';
import { TableSize } from '../api/TableSize';
import { Warehouse } from '../api/Warehouse';
import * as Redraw from '../operate/Redraw';
import * as Bars from '../resize/Bars';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
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
      return Structs.elementnew(row, isNew, false);
    }));
    return rowOfCells.getOrThunk(() => Structs.elementnew(generators.row(), true, false));
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

const extractCells = (warehouse: Warehouse, target: TargetSelection, predicate: (detail: DetailExt) => boolean): Optional<DetailExt[]> => {
  const details = Arr.map(target.selection, (cell) => {
    return TableLookup.cell(cell)
      .bind((lc) => findInWarehouse(warehouse, lc))
      .filter(predicate);
  });
  const cells = Optionals.cat(details);
  return Optionals.someIf(cells.length > 0, cells);
};

type EqEle = (e1: SugarElement, e2: SugarElement) => boolean;
type Operation<INFO, GW extends GeneratorsWrapper> = (model: Structs.RowCells[], info: INFO, eq: EqEle, w: GW) => TableOperationResult;
type Extract<RAW, INFO> = (warehouse: Warehouse, target: RAW) => Optional<INFO>;
type Adjustment<INFO> = <T extends Structs.DetailNew>(table: SugarElement, grid: Structs.RowDataNew<T>[], info: INFO, tableSize: TableSize, resizeBehaviour: ResizeBehaviour.ResizeBehaviour) => void;
type PostAction = (e: SugarElement) => void;
type GenWrap<GW extends GeneratorsWrapper> = (g: Generators) => GW;

export type OperationCallback<T> = (wire: ResizeWire, table: SugarElement<HTMLTableElement>, target: T, generators: Generators, sizing?: TableSize, resizeBehaviour?: ResizeBehaviour.ResizeBehaviour) => Optional<RunOperationOutput>;

const run = <RAW, INFO, GW extends GeneratorsWrapper>
(operation: Operation<INFO, GW>, extract: Extract<RAW, INFO>, adjustment: Adjustment<INFO>, postAction: PostAction, genWrappers: GenWrap<GW>): OperationCallback<RAW> =>
  (wire: ResizeWire, table: SugarElement<HTMLTableElement>, target: RAW, generators: Generators, sizing?: TableSize, resizeBehaviour?: ResizeBehaviour.ResizeBehaviour): Optional<RunOperationOutput> => {
    const warehouse = Warehouse.fromTable(table);
    const output = extract(warehouse, target).map((info) => {
      const model = fromWarehouse(warehouse, generators);
      const result = operation(model, info, Compare.eq, genWrappers(generators));
      const lockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(result.grid);
      const grid = toDetailList(result.grid, generators);
      return {
        info,
        grid,
        cursor: result.cursor,
        lockedColumns
      };
    });

    return output.bind((out) => {
      const newElements = Redraw.render(table, out.grid);
      const tableSizing = Optional.from(sizing).getOrThunk(() => TableSize.getTableSize(table));
      const resizing = Optional.from(resizeBehaviour).getOrThunk(ResizeBehaviour.preserveTable);
      adjustment(table, out.grid, out.info, tableSizing, resizing);
      postAction(table);
      Bars.refresh(wire, table);
      // Update locked cols attribute
      Attribute.remove(table, LockedColumnUtils.LOCKED_COL_ATTR);
      if (out.lockedColumns.length > 0) {
        Attribute.set(table, LockedColumnUtils.LOCKED_COL_ATTR, out.lockedColumns.join(','));
      }
      return Optional.some({
        cursor: out.cursor,
        newRows: newElements.newRows,
        newCells: newElements.newCells
      });
    });
  };

const onCell = (warehouse: Warehouse, target: TargetElement): Optional<DetailExt> =>
  TableLookup.cell(target.element).bind((cell) => findInWarehouse(warehouse, cell));

const onPaste = (warehouse: Warehouse, target: TargetPaste): Optional<ExtractPaste> =>
  TableLookup.cell(target.element).bind((cell) => findInWarehouse(warehouse, cell).map((details) => {
    const value: ExtractPaste = {
      ...details,
      generators: target.generators,
      clipboard: target.clipboard
    };
    return value;
  }));

const onPasteByEditor = (warehouse: Warehouse, target: TargetPasteRows): Optional<ExtractPasteRows> =>
  extractCells(warehouse, target, Fun.always).map((cells) => ({
    cells,
    generators: target.generators,
    clipboard: target.clipboard
  }));

const onMergable = (_warehouse: Warehouse, target: TargetMergable): Optional<ExtractMergable> =>
  target.mergable;

const onUnmergable = (_warehouse: Warehouse, target: TargetUnmergable): Optional<SugarElement[]> =>
  target.unmergable;

const onCells = (warehouse: Warehouse, target: TargetSelection): Optional<DetailExt[]> =>
  extractCells(warehouse, target, Fun.always);

// Custom unlocked extractors

const onUnlockedCell = (warehouse: Warehouse, target: TargetElement): Optional<Structs.DetailExt> =>
  onCell(warehouse, target).filter((detail) => !detail.isLocked);

const onUnlockedCells = (warehouse: Warehouse, target: TargetSelection): Optional<Structs.DetailExt[]> =>
  extractCells(warehouse, target, (detail) => !detail.isLocked);

const isUnlockedTableCell = (warehouse: Warehouse, cell: SugarElement) => findInWarehouse(warehouse, cell).exists((detail) => !detail.isLocked);
const allUnlocked = (warehouse: Warehouse, cells: SugarElement[]) => Arr.forall(cells, (cell) => isUnlockedTableCell(warehouse, cell));

// If any locked columns are present in the selection, then don't want to be able to merge
const onUnlockedMergable = (warehouse: Warehouse, target: TargetMergable): Optional<ExtractMergable> =>
  onMergable(warehouse, target).filter((mergeable) => allUnlocked(warehouse, mergeable.cells));

// If any locked columns are present in the selection, then don't want to be able to unmerge
const onUnlockedUnmergable = (warehouse: Warehouse, target: TargetUnmergable): Optional<SugarElement[]> =>
  onUnmergable(warehouse, target).filter((cells) => allUnlocked(warehouse, cells));

export {
  run,
  toDetailList,
  onCell,
  onCells,
  onPaste,
  onPasteByEditor,
  onMergable,
  onUnmergable,
  onUnlockedCell,
  onUnlockedCells,
  onUnlockedMergable,
  onUnlockedUnmergable
};

