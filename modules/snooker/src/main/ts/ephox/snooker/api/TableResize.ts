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
  readonly table: SugarElement<HTMLTableElement>;
  readonly type: ResizeType;
}

export interface AfterTableResizeEvent {
  readonly table: SugarElement<HTMLTableElement>;
  readonly type: ResizeType;
}

interface TableResizeEventRegistry {
  readonly beforeResize: Bindable<BeforeTableResizeEvent>;
  readonly afterResize: Bindable<AfterTableResizeEvent>;
  readonly startDrag: Bindable<{}>;
}

interface TableResizeEvents {
  readonly registry: TableResizeEventRegistry;
  readonly trigger: {
    readonly beforeResize: (table: SugarElement<HTMLTableElement>, type: ResizeType) => void;
    readonly afterResize: (table: SugarElement<HTMLTableElement>, type: ResizeType) => void;
    readonly startDrag: () => void;
  };
}

export interface TableResize {
  readonly on: () => void;
  readonly off: () => void;
  readonly refreshBars: (table: SugarElement<HTMLTableElement>) => void;
  readonly hideBars: () => void;
  readonly showBars: () => void;
  readonly destroy: () => void;
  readonly events: TableResizeEventRegistry;
}

const create = (wire: ResizeWire, resizing: ResizeBehaviour, lazySizing: (element: SugarElement<HTMLTableElement>) => TableSize): TableResize => {
  const hdirection = BarPositions.height;
  const vdirection = BarPositions.width;
  const manager = BarManager(wire);

  const events: TableResizeEvents = Events.create({
    beforeResize: Event([ 'table', 'type' ]),
    afterResize: Event([ 'table', 'type' ]),
    startDrag: Event([]),
  });

  manager.events.adjustHeight.bind((event) => {
    const table = event.table;
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
    events.trigger.beforeResize(table, 'col');
    const delta = vdirection.delta(event.delta, table);
    const tableSize = lazySizing(table);
    Adjustments.adjustWidth(table, delta, event.column, resizing, tableSize);
    events.trigger.afterResize(table, 'col');
  });

  return {
    on: manager.on,
    off: manager.off,
    refreshBars: manager.refresh,
    hideBars: manager.hideBars,
    showBars: manager.showBars,
    destroy: manager.destroy,
    events: events.registry
  };
};

export const TableResize = {
  create
};
