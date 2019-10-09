import { Button, Behaviour, Dragging, Unselecting, DragCoord, Attachment, GuiFactory, Boxes, Memento } from '@ephox/alloy';
import { PlatformDetection } from '@ephox/sand';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Position, Element, SelectorFilter, Body, Remove, Css, Insert } from '@ephox/sugar';

const setup = (editor, sink) => {
  const tlTds = Cell<Element[]>([]);
  const brTds = Cell<Element[]>([]);

  const insertDebugDiv = (left, top, width, height, color, clazz) => {
    const debugArea = Element.fromHtml(`<div class="${clazz}"></div>`);
    Css.setAll(debugArea, {
      'left': left.toString() + 'px',
      'top': top.toString() + 'px',
      'background-color': color,
      'position': 'absolute',
      'width': width.toString() + 'px',
      'height': height.toString() + 'px',
      'opacity': '0.2'
    });
    Insert.append(Body.body(), debugArea);
  };

  const getTopLeftSnap = (td) => {
    const box = Boxes.absolute(td);
    return memTopLeft.getOpt(sink).fold(() => {
      return Dragging.snap({
        sensor: DragCoord.absolute(box.x() - 20, box.y() - 20),
        range: Position(box.width(), box.height()),
        output: DragCoord.absolute(Option.some(box.x()), Option.some(box.y())),
        extra: {
          td
        }
      });
    }, (selectorHandle) => {
      const sensorLeft = box.x() - 20;
      const sensorTop = box.y() - 20;
      const sensorWidth = 40; // box.width();
      const sensorHeight = 40; // box.height();
      const rect = selectorHandle.element().dom().getBoundingClientRect();
      insertDebugDiv(sensorLeft, sensorTop, sensorWidth, sensorHeight, 'green', 'top-left-snap-debug');
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
    const body = Body.body();
    const debugs = SelectorFilter.descendants(body, '.top-left-snap-debug');
    Arr.each(debugs, (debugArea) => {
      Remove.remove(debugArea);
    });
    return Arr.map(tlTds.get(), (td) => {
      return getTopLeftSnap(td);
    });
  };

  const getBottomRightSnap = (td) => {
    const box = Boxes.absolute(td);
    return memBottomRight.getOpt(sink).fold(() => {
      return Dragging.snap({
        sensor: DragCoord.absolute(box.x() - 20, box.y() - 20),
        range: Position(box.width(), box.height()),
        output: DragCoord.absolute(Option.some(box.right()), Option.some(box.bottom())),
        extra: {
          td
        }
      });
    }, (selectorHandle) => {
      const sensorLeft = box.right() - 20;
      const sensorTop = box.bottom() - 20;
      const sensorWidth = 40; // box.width();
      const sensorHeight = 40; // box.height();
      const rect = selectorHandle.element().dom().getBoundingClientRect();
      insertDebugDiv(sensorLeft, sensorTop, sensorWidth, sensorHeight, 'red', 'bottom-right-snap-debug');
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

  // TODO: Make the sensor snap to the bottom right by subtracting the width and height of the button from the output
  const getBottomRightSnaps = () => {
    const body = Body.body();
    const debugs = SelectorFilter.descendants(body, '.bottom-right-snap-debug');
    Arr.each(debugs, (debugArea) => {
      Remove.remove(debugArea);
    });
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
        innerHtml: 'TL',
        styles: {
          display: 'inline-block',
          background: '#333',
          color: '#fff'
        }
      },

      buttonBehaviours: Behaviour.derive([
        Dragging.config(
          PlatformDetection.detect().deviceType.isTouch() ? {
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
        tag: 'span',
        innerHtml: 'BR',
        styles: {
          display: 'inline-block',
          background: '#333',
          color: '#fff'
        }
      },

      buttonBehaviours: Behaviour.derive([
        Dragging.config(
          PlatformDetection.detect().deviceType.isTouch() ? {
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

      getTopLeftSnaps();
      const tLSnap = getTopLeftSnap(e.start);
      Dragging.snapTo(topLeft, tLSnap);

      getBottomRightSnaps();
      const firstSnap = getBottomRightSnap(e.finish);
      Dragging.snapTo(bottomRight, firstSnap);
    });
  });

  editor.on('tableselectionclear', () => {
    if (isVisible.get()) {
      Attachment.detach(topLeft);
      Attachment.detach(bottomRight);
      isVisible.set(false);
    }
  });
};

export default {
  setup
};