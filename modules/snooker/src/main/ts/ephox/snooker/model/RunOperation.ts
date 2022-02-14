import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Compare, SugarElement } from '@ephox/sugar';

import { Generators, GeneratorsWrapper, SimpleGenerators } from '../api/Generators';
import * as ResizeBehaviour from '../api/ResizeBehaviour';
import * as Structs from '../api/Structs';
import * as TableLookup from '../api/TableLookup';
import { TableOperationResult } from '../api/TableOperations';
import { TableSection } from '../api/TableSection';
import { TableSize } from '../api/TableSize';
import { Warehouse } from '../api/Warehouse';
import * as Redraw from '../operate/Redraw';
import * as LockedColumnUtils from '../util/LockedColumnUtils';
import { CompElm, RowCell, RowElement } from '../util/TableTypes';
import * as Transitions from './Transitions';

export interface OperationBehaviours {
  readonly sizing?: TableSize;
  readonly resize?: ResizeBehaviour.ResizeBehaviour;
  readonly section?: TableSection;
}

export interface RunOperationOutput {
  readonly cursor: Optional<SugarElement<HTMLTableCellElement>>;
  readonly newRows: SugarElement<HTMLTableRowElement>[];
  readonly newCells: SugarElement<HTMLTableCellElement>[];
}

export interface TargetElement {
  readonly element: SugarElement<Node>;
}

export interface TargetSelection {
  readonly selection: SugarElement<Node>[];
}

export interface TargetMergable {
  readonly mergable: Optional<ExtractMergable>;
}

export interface TargetUnmergable {
  readonly unmergable: Optional<SugarElement<HTMLTableCellElement>[]>;
}

// combines the above 4 interfaces because this is what data we actually get from TinyMCE
export interface CombinedTargets extends TargetElement, TargetSelection, TargetMergable, TargetUnmergable { }

export interface TargetPaste {
  readonly element: SugarElement<Node>;
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement<HTMLTableElement>;
}

export interface TargetPasteRows {
  readonly selection: SugarElement<Node>[];
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement<RowElement>[];
}

export interface ExtractMergable {
  readonly cells: SugarElement<HTMLTableCellElement>[];
  readonly bounds: Structs.Bounds;
}

export interface ExtractPaste extends Structs.DetailExt {
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement<HTMLTableElement>;
}

export interface ExtractPasteRows {
  readonly cells: Structs.DetailExt[];
  readonly generators: SimpleGenerators;
  readonly clipboard: SugarElement<RowElement>[];
}

const fromWarehouse = (warehouse: Warehouse, generators: Generators) =>
  Transitions.toGrid(warehouse, generators, false);

const toDetailList = <R extends RowElement>(grid: Structs.RowCells<R>[]): Structs.RowDetailNew<Structs.DetailNew<RowCell<R>>, R>[] =>
  Transitions.toDetails(grid, Compare.eq);

const findInWarehouse = (warehouse: Warehouse, element: SugarElement<HTMLTableCellElement>): Optional<Structs.DetailExt> => Arr.findMap(warehouse.all, (r) =>
  Arr.find(r.cells, (e) => Compare.eq(element, e.element))
);

const extractCells = (warehouse: Warehouse, target: TargetSelection, predicate: (detail: Structs.DetailExt) => boolean): Optional<Structs.DetailExt[]> => {
  const details = Arr.map(target.selection, (cell) => {
    return TableLookup.cell(cell)
      .bind((lc) => findInWarehouse(warehouse, lc))
      .filter(predicate);
  });
  const cells = Optionals.cat(details);
  return Optionals.someIf(cells.length > 0, cells);
};

export type Operation<INFO, GW extends GeneratorsWrapper> = (model: Structs.RowCells[], info: INFO, eq: CompElm, w: GW, headers: TableSection) => TableOperationResult;
export type Extract<RAW, INFO> = (warehouse: Warehouse, target: RAW) => Optional<INFO>;
export type Adjustment<INFO> = <T extends Structs.DetailNew>(table: SugarElement<HTMLTableElement>, grid: Structs.RowDetailNew<T>[], info: INFO, behaviours: Required<OperationBehaviours>) => void;
export type PostAction = (e: SugarElement<HTMLTableElement>) => void;
export type GenWrap<GW extends GeneratorsWrapper> = (g: Generators) => GW;

export type OperationCallback<T> = (table: SugarElement<HTMLTableElement>, target: T, generators: Generators, behaviours?: OperationBehaviours) => Optional<RunOperationOutput>;

const run = <RAW, INFO, GW extends GeneratorsWrapper>
(operation: Operation<INFO, GW>, extract: Extract<RAW, INFO>, adjustment: Adjustment<INFO>, postAction: PostAction, genWrappers: GenWrap<GW>): OperationCallback<RAW> =>
  (table: SugarElement<HTMLTableElement>, target: RAW, generators: Generators, behaviours?: OperationBehaviours): Optional<RunOperationOutput> => {
    const warehouse = Warehouse.fromTable(table);
    const tableSection = Optional.from(behaviours?.section).getOrThunk(TableSection.fallback);
    const output = extract(warehouse, target).map((info) => {
      const model = fromWarehouse(warehouse, generators);
      const result = operation(model, info, Compare.eq, genWrappers(generators), tableSection);
      const lockedColumns = LockedColumnUtils.getLockedColumnsFromGrid(result.grid);
      const grid = toDetailList(result.grid);
      return {
        info,
        grid,
        cursor: result.cursor,
        lockedColumns
      };
    });

    return output.bind((out) => {
      const newElements = Redraw.render(table, out.grid);
      const tableSizing = Optional.from(behaviours?.sizing).getOrThunk(() => TableSize.getTableSize(table));
      const resizing = Optional.from(behaviours?.resize).getOrThunk(ResizeBehaviour.preserveTable);
      adjustment(table, out.grid, out.info, { sizing: tableSizing, resize: resizing, section: tableSection });
      postAction(table);
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

const onCell = (warehouse: Warehouse, target: TargetElement): Optional<Structs.DetailExt> =>
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

const onUnmergable = (_warehouse: Warehouse, target: TargetUnmergable): Optional<SugarElement<HTMLTableCellElement>[]> =>
  target.unmergable;

const onCells = (warehouse: Warehouse, target: TargetSelection): Optional<Structs.DetailExt[]> =>
  extractCells(warehouse, target, Fun.always);

// Custom unlocked extractors

const onUnlockedCell = (warehouse: Warehouse, target: TargetElement): Optional<Structs.DetailExt> =>
  onCell(warehouse, target).filter((detail) => !detail.isLocked);

const onUnlockedCells = (warehouse: Warehouse, target: TargetSelection): Optional<Structs.DetailExt[]> =>
  extractCells(warehouse, target, (detail) => !detail.isLocked);

const isUnlockedTableCell = (warehouse: Warehouse, cell: SugarElement<HTMLTableCellElement>) =>
  findInWarehouse(warehouse, cell).exists((detail) => !detail.isLocked);

const allUnlocked = (warehouse: Warehouse, cells: SugarElement<HTMLTableCellElement>[]) =>
  Arr.forall(cells, (cell) => isUnlockedTableCell(warehouse, cell));

// If any locked columns are present in the selection, then don't want to be able to merge
const onUnlockedMergable = (warehouse: Warehouse, target: TargetMergable): Optional<ExtractMergable> =>
  onMergable(warehouse, target).filter((mergeable) => allUnlocked(warehouse, mergeable.cells));

// If any locked columns are present in the selection, then don't want to be able to unmerge
const onUnlockedUnmergable = (warehouse: Warehouse, target: TargetUnmergable): Optional<SugarElement<HTMLTableCellElement>[]> =>
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

