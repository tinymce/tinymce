import { Button, Behaviour, Dragging, Unselecting, DragCoord, Attachment, GuiFactory, Boxes, Memento, AlloyComponent } from '@ephox/alloy';
import { PlatformDetection } from '@ephox/sand';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Position, Element, Traverse, Css } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const platform = PlatformDetection.detect();

const snapWidth = 40;
const snapOffset = snapWidth / 2;

const setup = (editor: Editor, sink: AlloyComponent) => {
  const tlTds = Cell<Element[]>([]);
  const brTds = Cell<Element[]>([]);

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

  const getTopLeftSnap = (td: Element) => {
    const box = Boxes.absolute(td);
    return memTopLeft.getOpt(sink).fold(() => {
      return Dragging.snap({
        sensor: DragCoord.absolute(box.x() - snapOffset, box.y() - snapOffset),
        range: Position(box.width(), box.height()),
        output: DragCoord.absolute(Option.some(box.x()), Option.some(box.y())),
        extra: {
          td
        }
      });
    }, (selectorHandle) => {
      const sensorLeft = box.x() - snapOffset;
      const sensorTop = box.y() - snapOffset;
      const sensorWidth = snapWidth; // box.width();
      const sensorHeight = snapWidth; // box.height();
      const rect = selectorHandle.element().dom().getBoundingClientRect();
      // insertDebugDiv(sensorLeft, sensorTop, sensorWidth, sensorHeight, 'green', 'top-left-snap-debug');
      return Dragging.snap({
        sensor: DragCoord.absolute(sensorLeft, sensorTop),
        range: Position(sensorWidth, sensorHeight),
        output: DragCoord.absolute(Option.some(box.x() - (rect.width / 2)), Option.some(box.y() - (rect.height / 2))),
        extra: {
          td
        }
      });
    });
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
    return memBottomRight.getOpt(sink).fold(() => {
      return Dragging.snap({
        sensor: DragCoord.absolute(box.x() - snapOffset, box.y() - snapOffset),
        range: Position(box.width(), box.height()),
        output: DragCoord.absolute(Option.some(box.right()), Option.some(box.bottom())),
        extra: {
          td
        }
      });
    }, (selectorHandle) => {
      const sensorLeft = box.right() - snapOffset;
      const sensorTop = box.bottom() - snapOffset;
      const sensorWidth = snapWidth; // box.width();
      const sensorHeight = snapWidth; // box.height();
      const rect = selectorHandle.element().dom().getBoundingClientRect();
      // insertDebugDiv(sensorLeft, sensorTop, sensorWidth, sensorHeight, 'red', 'bottom-right-snap-debug');
      return Dragging.snap({
        sensor: DragCoord.absolute(sensorLeft, sensorTop),
        range: Position(sensorWidth, sensorHeight),
        output: DragCoord.absolute(Option.some(box.right() - (rect.width / 2)), Option.some(box.bottom() - (rect.height / 2))),
        extra: {
          td
        }
      });
    });
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

  const topLeftSnaps = {
    getSnapPoints: getTopLeftSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      startCell.set(extra.td);
      editor.fire('tableselectorchange', {
        start: startCell.get(),
        finish: finishCell.get()
      });
    },
    mustSnap: true
  };

  const bottomRightSnaps = {
    getSnapPoints: getBottomRightSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      finishCell.set(extra.td);
      editor.fire('tableselectorchange', {
        start: startCell.get(),
        finish: finishCell.get()
      });
    },
    mustSnap: true
  };

  const memTopLeft  = Memento.record(
    Button.sketch({
      dom: {
        tag: 'div',
        classes: ['tox-selector']
      },

      buttonBehaviours: Behaviour.derive([
        Dragging.config(
          platform.deviceType.isTouch() ? {
            mode: 'touch',
            snaps: topLeftSnaps
          } : {
            mode: 'mouse',
            blockerClass: 'blocker',
            snaps: topLeftSnaps
          }
        ),
        Unselecting.config({ })
      ]),
      eventOrder: {
        // Because this is a button, allow dragging. It will stop clicking.
        mousedown: [ 'dragging', 'alloy.base.behaviour' ]
      }
    })
  );

  const memBottomRight = Memento.record(
    Button.sketch({
      dom: {
        tag: 'div',
        classes: ['tox-selector']
      },

      buttonBehaviours: Behaviour.derive([
        Dragging.config(
          platform.deviceType.isTouch() ? {
            mode: 'touch',
            snaps: bottomRightSnaps
          } : {
            mode: 'mouse',
            blockerClass: 'blocker',
            snaps: bottomRightSnaps
          }
        ),
        Unselecting.config({ })
      ]),
      eventOrder: {
        // Because this is a button, allow dragging. It will stop clicking.
        mousedown: [ 'dragging', 'alloy.base.behaviour' ]
      }
    })
  );

  const topLeft = GuiFactory.build(memTopLeft.asSpec());
  const bottomRight = GuiFactory.build(memBottomRight.asSpec());

  const isVisible = Cell<Boolean>(false);
  const startCell = Cell<any>(null);
  const finishCell = Cell<any>(null);

  const showOrHideHandle = (selector, cell, isAbove, isBelow) => {
    const cellRect = cell.dom().getBoundingClientRect();
    Css.remove(selector.element(), 'display');
    const viewportHeight = Traverse.defaultView(Element.fromDom(editor.getBody())).dom().innerHeight;
    const aboveViewport = isAbove(cellRect);
    const belowViewport = isBelow(cellRect, viewportHeight);
    if (aboveViewport || belowViewport) {
      Css.set(selector.element(), 'display', 'none');
    }
  };

  const snapLastTopLeft = () => {
    const cell = startCell.get();
    snapTopLeft(cell);
  };

  const snapTopLeft = (cell: Element) => {
    const snap = getTopLeftSnap(cell);
    Dragging.snapTo(topLeft, snap);
    const isAbove = (rect) => {
      return rect.top < 0;
    };
    const isBelow = (rect, viewportHeight) => {
      return rect.top > viewportHeight;
    };
    showOrHideHandle(topLeft, cell, isAbove, isBelow);
  };

  const snapLastBottomRight = () => {
    const cell = finishCell.get();
    snapBottomRight(cell);
  };

  const snapBottomRight = (cell: Element) => {
    const firstSnap = getBottomRightSnap(cell);
    Dragging.snapTo(bottomRight, firstSnap);
    const isAbove = (rect) => {
      return rect.bottom < 0;
    };
    const isBelow = (rect, viewportHeight) => {
      return rect.bottom > viewportHeight;
    };
    showOrHideHandle(bottomRight, cell, isAbove, isBelow);
  };

  // TODO: Make this work for desktop maybe?
  if (platform.deviceType.isTouch()) {
    editor.on('tableselectionchange', (e) => {
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

    editor.on('resize ScrollContent', () => {
      snapLastTopLeft();
      snapLastBottomRight();
    });

    editor.on('tableselectionclear', () => {
      if (isVisible.get()) {
        Attachment.detach(topLeft);
        Attachment.detach(bottomRight);
        isVisible.set(false);
      }
    });
  }
};

export default {
  setup
};