import { Bindable, Event, Events } from '@ephox/porkbun';
import { SugarElement } from '@ephox/sugar';
import * as Adjustments from '../resize/Adjustments';
import { BarManager } from '../resize/BarManager';
import * as BarPositions from '../resize/BarPositions';
import { ResizeBehaviour } from './ResizeBehaviour';
import { ResizeWire } from './ResizeWire';
import { TableSize } from './TableSize';

type BarPositions<A> = BarPositions.BarPositions<A>;
type ResizeType = 'row' | 'col';

export interface BeforeTableResizeEvent {
  readonly table: SugarElement;
  readonly type: ResizeType;
}

export interface AfterTableResizeEvent {
  readonly table: SugarElement;
  readonly type: ResizeType;
}

type TableResizeEventRegistry = {
  readonly beforeResize: Bindable<BeforeTableResizeEvent>;
  readonly afterResize: Bindable<AfterTableResizeEvent>;
  readonly startDrag: Bindable<{}>;
};

interface TableResizeEvents {
  readonly registry: TableResizeEventRegistry;
  readonly trigger: {
    readonly beforeResize: (table: SugarElement, type: ResizeType) => void;
    readonly afterResize: (table: SugarElement, type: ResizeType) => void;
    readonly startDrag: () => void;
  };
}

export interface TableResize {
  readonly on: () => void;
  readonly off: () => void;
  readonly hideBars: () => void;
  readonly showBars: () => void;
  readonly destroy: () => void;
  readonly events: TableResizeEventRegistry;
}

// const isResizable = (elm: SugarElement<Element>) => Attribute.get(elm, 'data-mce-resize') !== 'false';

// Checking cells could be an issue with a number column as that cell in the row will have the data-mce-resize set preventing any of the rows from being resized
// const canResizeRow = (table: SugarElement<HTMLTableElement>, rowIndex: number, canResize: (elm: SugarElement<Element>) => boolean) => {
//   const warehouse = Warehouse.fromTable(table);
//   const rowOpt = Optional.from(warehouse.all[rowIndex]);
//   const editableRow = rowOpt.map((row) => row.element).forall(canResize);
//   const editableCells = rowOpt.map((row) => row.cells).forall((cells) => Arr.forall(cells, (cell) => canResize(cell.element)));
//   return editableRow && editableCells;
// };

// // Should I also check colgroup element if it exists?
// const canResizeColumn = (table: SugarElement<HTMLTableElement>, columnIndex: number, canResize: (elm: SugarElement<Element>) => boolean) => {
//   const warehouse = Warehouse.fromTable(table);
//   // const editableCol = Warehouse.getColumnAt(warehouse, columnIndex).map((col) => col.element).forall(canResize);
//   const editableCol = Warehouse.getColumnAt(warehouse, columnIndex).map((col) => col.element).forall(canResize);
//   const columnCells = Warehouse.filterItems(warehouse, (cell) => cell.column === columnIndex);
//   const editableCells = Arr.forall(columnCells, (cell) => canResize(cell.element));
//   return editableCol && editableCells;
// };

const create = (wire: ResizeWire, resizing: ResizeBehaviour, lazySizing: (element: SugarElement<HTMLTableElement>) => TableSize, canResize: (elm: SugarElement<Element>) => boolean): TableResize => {
  const hdirection = BarPositions.height;
  const vdirection = BarPositions.width;
  const manager = BarManager(wire, canResize);

  const events = Events.create({
    beforeResize: Event([ 'table', 'type' ]),
    afterResize: Event([ 'table', 'type' ]),
    startDrag: Event([])
  }) as TableResizeEvents;

  manager.events.adjustHeight.bind((event) => {
    const table = event.table;
    // if (canResizeRow(table, event.row, canResize)) {
    // }
    events.trigger.beforeResize(table, 'row');
    const delta = hdirection.delta(event.delta, table);
    // TODO: Use the resizing behaviour for heights as well
    Adjustments.adjustHeight(table, delta, event.row, hdirection);
    events.trigger.afterResize(table, 'row');
  });

  manager.events.startAdjust.bind((_event) => {
    events.trigger.startDrag();
  });

  manager.events.adjustWidth.bind((event) => {
    const table = event.table;
    // Have a canResizeColumn function?
    // if (canResizeColumn(table, event.column, canResize)) {
    // }
    events.trigger.beforeResize(table, 'col');
    const delta = vdirection.delta(event.delta, table);
    const tableSize = lazySizing(table);
    Adjustments.adjustWidth(table, delta, event.column, resizing, tableSize);
    events.trigger.afterResize(table, 'col');
  });

  return {
    on: manager.on,
    off: manager.off,
    hideBars: manager.hideBars,
    showBars: manager.showBars,
    destroy: manager.destroy,
    events: events.registry
  };
};

export const TableResize = {
  create
};
