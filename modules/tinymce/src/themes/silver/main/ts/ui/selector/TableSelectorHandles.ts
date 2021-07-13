/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent, Attachment, Behaviour, Boxes, Button, DragCoord, Dragging, DraggingTypes, GuiFactory, Memento, Unselecting
} from '@ephox/alloy';
import { Arr, Cell, Optional, Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Compare, Css, SugarElement, SugarPosition, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

interface SnapExtra {
  td: SugarElement<HTMLTableDataCellElement>;
}

const snapWidth = 40;
const snapOffset = snapWidth / 2;

// const insertDebugDiv = (left, top, width, height, color, clazz) => {
//   const debugArea = SugarElement.fromHtml(`<div class="${clazz}"></div>`);
//   Css.setAll(debugArea, {
//     'left': left.toString() + 'px',
//     'top': top.toString() + 'px',
//     'background-color': color,
//     'position': 'absolute',
//     'width': width.toString() + 'px',
//     'height': height.toString() + 'px',
//     'opacity': '0.2'
//   });
//   Insert.append(SugarBody.body(), debugArea);
// };

const calcSnap = (selectorOpt: Optional<AlloyComponent>, td: SugarElement<HTMLTableDataCellElement>, x: number, y: number, width: number, height: number) => selectorOpt.fold(() => Dragging.snap({
  sensor: DragCoord.absolute(x - snapOffset, y - snapOffset),
  range: SugarPosition(width, height),
  output: DragCoord.absolute(Optional.some(x), Optional.some(y)),
  extra: {
    td
  }
}), (selectorHandle) => {
  const sensorLeft = x - snapOffset;
  const sensorTop = y - snapOffset;
  const sensorWidth = snapWidth; // box.width();
  const sensorHeight = snapWidth; // box.height();
  const rect = selectorHandle.element.dom.getBoundingClientRect();
  // insertDebugDiv(sensorLeft, sensorTop, sensorWidth, sensorHeight, 'green', 'top-left-snap-debug');
  return Dragging.snap({
    sensor: DragCoord.absolute(sensorLeft, sensorTop),
    range: SugarPosition(sensorWidth, sensorHeight),
    output: DragCoord.absolute(Optional.some(x - (rect.width / 2)), Optional.some(y - (rect.height / 2))),
    extra: {
      td
    }
  });
});

const getSnapsConfig = (getSnapPoints: () => DraggingTypes.SnapConfig<SnapExtra>[], cell: Singleton.Value<SugarElement<HTMLTableDataCellElement>>, onChange: (td: SugarElement<HTMLTableDataCellElement>) => void): DraggingTypes.SnapsConfigSpec<SnapExtra> => {
  // Can't use Optional.is() here since we need to do a dom compare, not an equality compare
  const isSameCell = (cellOpt: Optional<SugarElement<HTMLTableDataCellElement>>, td: SugarElement<HTMLTableDataCellElement>) => cellOpt.exists((currentTd) => Compare.eq(currentTd, td));

  return {
    getSnapPoints,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      const td = extra.td;
      if (!isSameCell(cell.get(), td)) {
        cell.set(td);
        onChange(td);
      }
    },
    mustSnap: true
  };
};

const createSelector = (snaps: DraggingTypes.SnapsConfigSpec<SnapExtra>) => Memento.record(
  Button.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-selector' ]
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
  const tlTds = Cell<SugarElement<HTMLTableDataCellElement>[]>([]);
  const brTds = Cell<SugarElement<HTMLTableDataCellElement>[]>([]);
  const isVisible = Cell<Boolean>(false);
  const startCell = Singleton.value<SugarElement<HTMLTableDataCellElement>>();
  const finishCell = Singleton.value<SugarElement<HTMLTableDataCellElement>>();

  const getTopLeftSnap = (td: SugarElement<HTMLTableDataCellElement>) => {
    const box = Boxes.absolute(td);
    return calcSnap(memTopLeft.getOpt(sink), td, box.x, box.y, box.width, box.height);
  };

  const getTopLeftSnaps = () =>
    // const body = SugarBody.body();
    // const debugs = SelectorFilter.descendants(body, '.top-left-snap-debug');
    // Arr.each(debugs, (debugArea) => {
    //   Remove.remove(debugArea);
    // });
    Arr.map(tlTds.get(), (td) => getTopLeftSnap(td));

  const getBottomRightSnap = (td: SugarElement<HTMLTableDataCellElement>) => {
    const box = Boxes.absolute(td);
    return calcSnap(memBottomRight.getOpt(sink), td, box.right, box.bottom, box.width, box.height);
  };

  const getBottomRightSnaps = () =>
    // const body = SugarBody.body();
    // const debugs = SelectorFilter.descendants(body, '.bottom-right-snap-debug');
    // Arr.each(debugs, (debugArea) => {
    //   Remove.remove(debugArea);
    // });
    Arr.map(brTds.get(), (td) => getBottomRightSnap(td));

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

  const showOrHideHandle = (selector: AlloyComponent, cell: SugarElement<HTMLTableDataCellElement>, isAbove: (rect: ClientRect) => boolean, isBelow: (rect: ClientRect, viewportHeight: number) => boolean) => {
    const cellRect = cell.dom.getBoundingClientRect();
    Css.remove(selector.element, 'display');
    const viewportHeight = Traverse.defaultView(SugarElement.fromDom(editor.getBody())).dom.innerHeight;
    const aboveViewport = isAbove(cellRect);
    const belowViewport = isBelow(cellRect, viewportHeight);
    if (aboveViewport || belowViewport) {
      Css.set(selector.element, 'display', 'none');
    }
  };

  const snapTo = (selector: AlloyComponent, cell: SugarElement<HTMLTableDataCellElement>, getSnapConfig: (cell: SugarElement<HTMLTableDataCellElement>) => DraggingTypes.SnapConfig<SnapExtra>, pos: 'top' | 'bottom') => {
    const snap = getSnapConfig(cell);
    Dragging.snapTo(selector, snap);
    const isAbove = (rect: ClientRect) => rect[pos] < 0;
    const isBelow = (rect: ClientRect, viewportHeight: number) => rect[pos] > viewportHeight;
    showOrHideHandle(selector, cell, isAbove, isBelow);
  };

  const snapTopLeft = (cell: SugarElement<HTMLTableDataCellElement>) => snapTo(topLeft, cell, getTopLeftSnap, 'top');
  const snapLastTopLeft = () => startCell.get().each(snapTopLeft);

  const snapBottomRight = (cell: SugarElement<HTMLTableDataCellElement>) => snapTo(bottomRight, cell, getBottomRightSnap, 'bottom');
  const snapLastBottomRight = () => finishCell.get().each(snapBottomRight);

  // TODO: Make this work for desktop maybe?
  if (PlatformDetection.detect().deviceType.isTouch()) {
    editor.on('TableSelectionChange', (e) => {
      if (!isVisible.get()) {
        Attachment.attach(sink, topLeft);
        Attachment.attach(sink, bottomRight);
        isVisible.set(true);
      }
      startCell.set(e.start);
      finishCell.set(e.finish);

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
      startCell.clear();
      finishCell.clear();
    });
  }
};

export {
  setup
};
