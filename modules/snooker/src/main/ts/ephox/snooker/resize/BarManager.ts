import { Dragger } from '@ephox/dragster';
import { Fun, Optional } from '@ephox/katamari';
import { Bindable, Event, Events } from '@ephox/porkbun';
import { Attribute, Class, Compare, ContentEditable, Css, DomEvent, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import { ResizeWire } from '../api/ResizeWire';
import * as Styles from '../style/Styles';
import * as CellUtils from '../util/CellUtils';
import { BarMutation } from './BarMutation';
import * as Bars from './Bars';

export interface DragAdjustHeightEvent {
  readonly table: SugarElement<HTMLTableElement>;
  readonly delta: number;
  readonly row: number;
}

export interface DragAdjustWidthEvent {
  readonly table: SugarElement<HTMLTableElement>;
  readonly delta: number;
  readonly column: number;
}

export interface DragAdjustEvents {
  readonly registry: {
    readonly adjustHeight: Bindable<DragAdjustHeightEvent>;
    readonly adjustWidth: Bindable<DragAdjustWidthEvent>;
    readonly startAdjust: Bindable<{}>;
  };
  readonly trigger: {
    readonly adjustHeight: (table: SugarElement<HTMLTableElement>, delta: number, row: number) => void;
    readonly adjustWidth: (table: SugarElement<HTMLTableElement>, delta: number, column: number) => void;
    readonly startAdjust: () => void;
  };
}

export interface BarManager {
  readonly destroy: () => void;
  readonly refresh: (table: SugarElement<HTMLTableElement>) => void;
  readonly on: () => void;
  readonly off: () => void;
  readonly hideBars: () => void;
  readonly showBars: () => void;
  readonly events: DragAdjustEvents['registry'];
}

const resizeBarDragging = Styles.resolve('resizer-bar-dragging');

export const BarManager = (wire: ResizeWire): BarManager => {
  const mutation = BarMutation();
  const resizing = Dragger.transform(mutation, {});

  let hoverTable = Optional.none<SugarElement<HTMLTableElement>>();

  const getResizer = (element: SugarElement<Element>, type: string) => {
    return Optional.from(Attribute.get(element, type));
  };

  /* Reposition the bar as the user drags */
  mutation.events.drag.bind((event) => {
    getResizer(event.target, 'data-row').each((_dataRow) => {
      const currentRow = CellUtils.getCssValue(event.target, 'top');
      Css.set(event.target, 'top', currentRow + event.yDelta + 'px');
    });

    getResizer(event.target, 'data-column').each((_dataCol) => {
      const currentCol = CellUtils.getCssValue(event.target, 'left');
      Css.set(event.target, 'left', currentCol + event.xDelta + 'px');
    });
  });

  const getDelta = (target: SugarElement<Element>, dir: string) => {
    const newX = CellUtils.getCssValue(target, dir);
    const oldX = CellUtils.getAttrValue(target, 'data-initial-' + dir, 0);
    return newX - oldX;
  };

  /* Resize the column once the user releases the mouse */
  resizing.events.stop.bind(() => {
    mutation.get().each((target) => {
      hoverTable.each((table) => {
        getResizer(target, 'data-row').each((row) => {
          const delta = getDelta(target, 'top');
          Attribute.remove(target, 'data-initial-top');
          events.trigger.adjustHeight(table, delta, parseInt(row, 10));
        });

        getResizer(target, 'data-column').each((column) => {
          const delta = getDelta(target, 'left');
          Attribute.remove(target, 'data-initial-left');
          events.trigger.adjustWidth(table, delta, parseInt(column, 10));
        });

        Bars.refresh(wire, table);
      });
    });

  });

  const handler = (target: SugarElement<Element>, dir: string) => {
    events.trigger.startAdjust();
    mutation.assign(target);
    Attribute.set(target, 'data-initial-' + dir, CellUtils.getCssValue(target, dir));
    Class.add(target, resizeBarDragging);
    Css.set(target, 'opacity', '0.2');
    resizing.go(wire.parent());
  };

  /* mousedown on resize bar: start dragging when the bar is clicked, storing the initial position. */
  const mousedown = DomEvent.bind(wire.parent(), 'mousedown', (event) => {
    if (Bars.isRowBar(event.target)) {
      handler(event.target, 'top');
    }

    if (Bars.isColBar(event.target)) {
      handler(event.target, 'left');
    }
  });

  const isRoot = (e: SugarElement<Node>) => {
    return Compare.eq(e, wire.view());
  };

  const findClosestEditableTable = (target: SugarElement<Node>): Optional<SugarElement<HTMLTableElement>> =>
    SelectorFind.closest<HTMLTableElement>(target, 'table', isRoot).filter(ContentEditable.isEditable);

  /* mouseover on table: When the mouse moves within the CONTENT AREA (NOT THE TABLE), refresh the bars. */
  const mouseover = DomEvent.bind(wire.view(), 'mouseover', (event) => {
    findClosestEditableTable(event.target).fold(
      () => {
        /*
        * mouseout is not reliable within ContentEditable, so for all other mouseover events we clear bars.
        * This is fairly safe to do frequently; it's a single querySelectorAll() on the content and Arr.map on the result.
        * If we _really_ need to optimise it further, we can start caching the bar references in the wire somehow.
        */
        if (SugarBody.inBody(event.target)) {
          Bars.destroy(wire);
        }
      },
      (table) => {
        if (resizing.isActive()) {
          hoverTable = Optional.some(table);
          Bars.refresh(wire, table);
        }
      }
    );
  });

  const destroy = () => {
    mousedown.unbind();
    mouseover.unbind();
    resizing.destroy();
    Bars.destroy(wire);
  };

  const refresh = (tbl: SugarElement<HTMLTableElement>) => {
    Bars.refresh(wire, tbl);
  };

  const events: DragAdjustEvents = Events.create({
    adjustHeight: Event([ 'table', 'delta', 'row' ]),
    adjustWidth: Event([ 'table', 'delta', 'column' ]),
    startAdjust: Event([])
  });

  return {
    destroy,
    refresh,
    on: resizing.on,
    off: resizing.off,
    hideBars: Fun.curry(Bars.hide, wire),
    showBars: Fun.curry(Bars.show, wire),
    events: events.registry
  };
};
