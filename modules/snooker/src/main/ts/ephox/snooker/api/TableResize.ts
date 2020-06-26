import { HTMLTableElement } from '@ephox/dom-globals';
import { Bindable, Event, Events } from '@ephox/porkbun';
import { Element } from '@ephox/sugar';
import * as Adjustments from '../resize/Adjustments';
import { BarManager } from '../resize/BarManager';
import * as BarPositions from '../resize/BarPositions';
import { ResizeWire } from './ResizeWire';
import { TableSize } from './TableSize';

type ColInfo = BarPositions.ColInfo;
type BarPositions<A> = BarPositions.BarPositions<A>;

export interface BeforeTableResizeEvent {
  readonly table: () => Element;
}

export interface AfterTableResizeEvent {
  readonly table: () => Element;
}

type TableResizeEventRegistry = {
  readonly beforeResize: Bindable<BeforeTableResizeEvent>;
  readonly afterResize: Bindable<AfterTableResizeEvent>;
  readonly startDrag: Bindable<{}>;
};

interface TableResizeEvents {
  readonly registry: TableResizeEventRegistry;
  readonly trigger: {
    readonly beforeResize: (table: Element) => void;
    readonly afterResize: (table: Element) => void;
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

const create = (wire: ResizeWire, vdirection: BarPositions<ColInfo>, lazySizing: (element: Element<HTMLTableElement>) => TableSize): TableResize => {
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
    Adjustments.adjustWidth(table, delta, event.column(), vdirection, tableSize);
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
