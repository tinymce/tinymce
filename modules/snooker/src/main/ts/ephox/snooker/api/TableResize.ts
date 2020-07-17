import { Bindable, Event, Events } from '@ephox/porkbun';
import { SugarElement } from '@ephox/sugar';
import * as Adjustments from '../resize/Adjustments';
import { BarManager } from '../resize/BarManager';
import * as BarPositions from '../resize/BarPositions';
import { ResizeBehaviour } from './ResizeBehaviour';
import { ResizeWire } from './ResizeWire';
import { TableSize } from './TableSize';

type ColInfo = BarPositions.ColInfo;
type BarPositions<A> = BarPositions.BarPositions<A>;

export interface BeforeTableResizeEvent {
  readonly table: () => SugarElement;
}

export interface AfterTableResizeEvent {
  readonly table: () => SugarElement;
}

type TableResizeEventRegistry = {
  readonly beforeResize: Bindable<BeforeTableResizeEvent>;
  readonly afterResize: Bindable<AfterTableResizeEvent>;
  readonly startDrag: Bindable<{}>;
};

interface TableResizeEvents {
  readonly registry: TableResizeEventRegistry;
  readonly trigger: {
    readonly beforeResize: (table: SugarElement) => void;
    readonly afterResize: (table: SugarElement) => void;
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

const create = (wire: ResizeWire, vdirection: BarPositions<ColInfo>, resizing: ResizeBehaviour, lazySizing: (element: SugarElement<HTMLTableElement>) => TableSize): TableResize => {
  const hdirection = BarPositions.height;
  const manager = BarManager(wire, vdirection, hdirection);

  const events = Events.create({
    beforeResize: Event([ 'table' ]),
    afterResize: Event([ 'table' ]),
    startDrag: Event([])
  }) as TableResizeEvents;

  manager.events.adjustHeight.bind((event) => {
    const table = event.table();
    events.trigger.beforeResize(table);
    const delta = hdirection.delta(event.delta(), table);
    // TODO: Use the resizing behaviour for heights as well
    Adjustments.adjustHeight(table, delta, event.row(), hdirection);
    events.trigger.afterResize(table);
  });

  manager.events.startAdjust.bind((_event) => {
    events.trigger.startDrag();
  });

  manager.events.adjustWidth.bind((event) => {
    const table = event.table();
    events.trigger.beforeResize(table);
    const delta = vdirection.delta(event.delta(), table);
    const tableSize = lazySizing(table);
    Adjustments.adjustWidth(table, delta, event.column(), vdirection, resizing, tableSize);
    events.trigger.afterResize(table);
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
