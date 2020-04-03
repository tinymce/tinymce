import { Event, Events, Bindable } from '@ephox/porkbun';
import * as Adjustments from '../resize/Adjustments';
import { BarManager } from '../resize/BarManager';
import * as BarPositions from '../resize/BarPositions';
import { ResizeWire } from './ResizeWire';
import { Element } from '@ephox/sugar';

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

const create = (wire: ResizeWire, vdirection: BarPositions<ColInfo>): TableResize => {
  const hdirection = BarPositions.height;
  const manager = BarManager(wire, vdirection, hdirection);

  const events = Events.create({
    beforeResize: Event([ 'table' ]),
    afterResize: Event([ 'table' ]),
    startDrag: Event([])
  }) as TableResizeEvents;

  manager.events.adjustHeight.bind(function (event) {
    events.trigger.beforeResize(event.table());
    const delta = hdirection.delta(event.delta(), event.table());
    Adjustments.adjustHeight(event.table(), delta, event.row(), hdirection);
    events.trigger.afterResize(event.table());
  });

  manager.events.startAdjust.bind(function (_event) {
    events.trigger.startDrag();
  });

  manager.events.adjustWidth.bind(function (event) {
    events.trigger.beforeResize(event.table());
    const delta = vdirection.delta(event.delta(), event.table());
    Adjustments.adjustWidth(event.table(), delta, event.column(), vdirection);
    events.trigger.afterResize(event.table());
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
