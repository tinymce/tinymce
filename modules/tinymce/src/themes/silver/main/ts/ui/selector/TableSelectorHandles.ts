import { AlloyComponent, Attachment, Behaviour, Boxes, Button, DragCoord, Dragging, DraggingTypes, GuiFactory, Memento, Unselecting } from '@ephox/alloy';
import { ClientRect } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, Css, Element, Position, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const platform = PlatformDetection.detect();

const snapWidth = 40;
const snapOffset = snapWidth / 2;

// const insertDebugDiv = (left, top, width, height, color, clazz) => {
//   const debugArea = Element.fromHtml(`<div class="${clazz}"></div>`);
//   Css.setAll(debugArea, {
//     'left': left.toString() + 'px',
//     'top': top.toString() + 'px',
//     'background-color': color,
//     'position': 'absolute',
//     'width': width.toString() + 'px',
//     'height': height.toString() + 'px',
//     'opacity': '0.2'
//   });
//   Insert.append(Body.body(), debugArea);
// };

const calcSnap = (selectorOpt: Option<AlloyComponent>, td: Element, x: number, y: number, width: number, height: number) => {
  return selectorOpt.fold(() => {
    return Dragging.snap({
      sensor: DragCoord.absolute(x - snapOffset, y - snapOffset),
      range: Position(width, height),
      output: DragCoord.absolute(Option.some(x), Option.some(y)),
      extra: {
        td
      }
    });
  }, (selectorHandle) => {
    const sensorLeft = x - snapOffset;
    const sensorTop = y - snapOffset;
    const sensorWidth = snapWidth; // box.width();
    const sensorHeight = snapWidth; // box.height();
    const rect = selectorHandle.element().dom().getBoundingClientRect();
    // insertDebugDiv(sensorLeft, sensorTop, sensorWidth, sensorHeight, 'green', 'top-left-snap-debug');
    return Dragging.snap({
      sensor: DragCoord.absolute(sensorLeft, sensorTop),
      range: Position(sensorWidth, sensorHeight),
      output: DragCoord.absolute(Option.some(x - (rect.width / 2)), Option.some(y - (rect.height / 2))),
      extra: {
        td
      }
    });
  });
};

const getSnapsConfig = (getSnapPoints: () => DraggingTypes.SnapConfig[], cell: Cell<Option<Element>>, onChange: (td: Element) => void): DraggingTypes.SnapsConfigSpec => {
  // Can't use Option.is() here since we need to do a dom compare, not an equality compare
  const isSameCell = (cellOpt: Option<Element>, td: Element) => cellOpt.exists((currentTd) => Compare.eq(currentTd, td));

  return {
    getSnapPoints,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      const td = extra.td;
      if (!isSameCell(cell.get(), td)) {
        cell.set(Option.some(td));
        onChange(td);
      }
    },
    mustSnap: true
  };
};

const createSelector = (snaps: DraggingTypes.SnapsConfigSpec) => Memento.record(
  Button.sketch({
    dom: {
      tag: 'div',
      classes: ['tox-selector']
    },

    buttonBehaviours: Behaviour.derive([
      Dragging.config({
        mode: 'mouseOrTouch',
        blockerClass: 'blocker',
        snaps
      }),
      Unselecting.config({ })
    ]),
    eventOrder: {
      // Because this is a button, allow dragging. It will stop clicking.
      mousedown: [ 'dragging', 'alloy.base.behaviour' ],
      touchstart: [ 'dragging', 'alloy.base.behaviour' ]
    }
  })
);

const setup = (editor: Editor, sink: AlloyComponent) => {
  const tlTds = Cell<Element[]>([]);
  const brTds = Cell<Element[]>([]);
  const isVisible = Cell<Boolean>(false);
  const startCell = Cell<Option<Element>>(Option.none());
  const finishCell = Cell<Option<Element>>(Option.none());

  const getTopLeftSnap = (td: Element) => {
    const box = Boxes.absolute(td);
    return calcSnap(memTopLeft.getOpt(sink), td, box.x(), box.y(), box.width(), box.height());
  };

  const getTopLeftSnaps = () => {
    // const body = Body.body();
    // const debugs = SelectorFilter.descendants(body, '.top-left-snap-debug');
    // Arr.each(debugs, (debugArea) => {
    //   Remove.remove(debugArea);
    // });
    return Arr.map(tlTds.get(), (td) => {
      return getTopLeftSnap(td);
    });
  };

  const getBottomRightSnap = (td: Element) => {
    const box = Boxes.absolute(td);
    return calcSnap(memBottomRight.getOpt(sink), td, box.right(), box.bottom(), box.width(), box.height());
  };

  const getBottomRightSnaps = () => {
    // const body = Body.body();
    // const debugs = SelectorFilter.descendants(body, '.bottom-right-snap-debug');
    // Arr.each(debugs, (debugArea) => {
    //   Remove.remove(debugArea);
    // });
    return Arr.map(brTds.get(), (td) => {
      return getBottomRightSnap(td);
    });
  };

  const topLeftSnaps = getSnapsConfig(getTopLeftSnaps, startCell, (start) => {
    finishCell.get().each((finish) => {
      editor.fire('TableSelectorChange', { start, finish });
    });
  });

  const bottomRightSnaps = getSnapsConfig(getBottomRightSnaps, finishCell, (finish) => {
    startCell.get().each((start) => {
      editor.fire('TableSelectorChange', { start, finish });
    });
  });

  const memTopLeft = createSelector(topLeftSnaps);
  const memBottomRight = createSelector(bottomRightSnaps);

  const topLeft = GuiFactory.build(memTopLeft.asSpec());
  const bottomRight = GuiFactory.build(memBottomRight.asSpec());

  const showOrHideHandle = (selector: AlloyComponent, cell: Element, isAbove: (rect: ClientRect) => boolean, isBelow: (rect: ClientRect, viewportHeight: number) => boolean) => {
    const cellRect = cell.dom().getBoundingClientRect();
    Css.remove(selector.element(), 'display');
    const viewportHeight = Traverse.defaultView(Element.fromDom(editor.getBody())).dom().innerHeight;
    const aboveViewport = isAbove(cellRect);
    const belowViewport = isBelow(cellRect, viewportHeight);
    if (aboveViewport || belowViewport) {
      Css.set(selector.element(), 'display', 'none');
    }
  };

  const snapTo = (selector: AlloyComponent, cell: Element, getSnapConfig: (cell: Element) => DraggingTypes.SnapConfig, pos: 'top' | 'bottom') => {
    const snap = getSnapConfig(cell);
    Dragging.snapTo(selector, snap);
    const isAbove = (rect: ClientRect) => {
      return rect[pos] < 0;
    };
    const isBelow = (rect: ClientRect, viewportHeight: number) => {
      return rect[pos] > viewportHeight;
    };
    showOrHideHandle(selector, cell, isAbove, isBelow);
  };

  const snapTopLeft = (cell: Element) => snapTo(topLeft, cell, getTopLeftSnap, 'top');
  const snapLastTopLeft = () => startCell.get().each(snapTopLeft);

  const snapBottomRight = (cell: Element) => snapTo(bottomRight, cell, getBottomRightSnap, 'bottom');
  const snapLastBottomRight = () => finishCell.get().each(snapBottomRight);

  // TODO: Make this work for desktop maybe?
  if (platform.deviceType.isTouch()) {
    editor.on('TableSelectionChange', (e) => {
      if (!isVisible.get()) {
        Attachment.attach(sink, topLeft);
        Attachment.attach(sink, bottomRight);
        isVisible.set(true);
      }
      startCell.set(Option.some(e.start));
      finishCell.set(Option.some(e.finish));

      e.otherCells.each((otherCells) => {
        tlTds.set(otherCells.upOrLeftCells);
        brTds.set(otherCells.downOrRightCells);

        snapTopLeft(e.start);
        snapBottomRight(e.finish);
      });
    });

    editor.on('ResizeEditor ResizeWindow ScrollContent', () => {
      snapLastTopLeft();
      snapLastBottomRight();
    });

    editor.on('TableSelectionClear', () => {
      if (isVisible.get()) {
        Attachment.detach(topLeft);
        Attachment.detach(bottomRight);
        isVisible.set(false);
      }
      startCell.set(Option.none());
      finishCell.set(Option.none());
    });
  }
};

export default {
  setup
};
