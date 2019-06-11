import { Event, Events, Bindable } from '@ephox/porkbun';
import Adjustments from '../resize/Adjustments';
import { BarManager } from '../resize/BarManager';
import { BarPositions, ColInfo } from '../resize/BarPositions';
import { ResizeWire } from './ResizeWire';
import { Element } from '@ephox/sugar';

export interface BeforeTableResizeEvent {
  table: () => Element;
}

export interface AfterTableResizeEvent {
  table: () => Element;
}

interface TableResizeEvents {
  registry: {
    beforeResize: Bindable<BeforeTableResizeEvent>;
    afterResize: Bindable<AfterTableResizeEvent>;
    startDrag: Bindable<{}>;
  };
  trigger: {
    beforeResize: (table: Element) => void;
    afterResize: (table: Element) => void;
    startDrag: () => void;
  };
}

export default function (wire: ResizeWire, vdirection: BarPositions<ColInfo>) {
  const hdirection = BarPositions.height;
  const manager = BarManager(wire, vdirection, hdirection);

  const events = Events.create({
    beforeResize: Event(['table']),
    afterResize: Event(['table']),
    startDrag: Event([])
  }) as TableResizeEvents;

  manager.events.adjustHeight.bind(function (event) {
    events.trigger.beforeResize(event.table());
    const delta = hdirection.delta(event.delta(), event.table());
    Adjustments.adjustHeight(event.table(), delta, event.row(), hdirection);
    events.trigger.afterResize(event.table());
  });

  manager.events.startAdjust.bind(function (event) {
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
}