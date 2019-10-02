import { Button, Behaviour, Dragging, Unselecting, DragCoord } from "@ephox/alloy";
import { PlatformDetection } from '@ephox/sand';
import { Arr, Option } from '@ephox/katamari';
import { Attr, Position } from '@ephox/sugar';

const getSelectors = (getTableBits, sink) => {
  const getTopLeftSnaps = () => {
    return Arr.map(getTableBits().topLeft, (td) => {
      const thisRect = td.dom().getBoundingClientRect();
      const col = parseInt(Attr.get(td, 'data-col'), 10);
      const row = parseInt(Attr.get(td, 'data-row'), 10);
      return Dragging.snap({
        sensor: DragCoord.fixed(thisRect.left, thisRect.top),
        range: Position(thisRect.width, thisRect.height),
        output: DragCoord.absolute(Option.some(thisRect.left), Option.some(thisRect.top)),
        extra: {
          row,
          col
        }
      });
    });
  };

  const topLeftSnaps = {
    getSnapPoints: getTopLeftSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      console.log(component, extra);
    },
    mustSnap: true
  };

  const topLeft = Button.sketch({
    dom: {
      tag: 'span',
      innerHtml: 'Drag me exceptionally long handle lol lol!',
      styles: {
        padding: '10px',
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
  });

  return {
    topLeft
  };
};

export {
  getSelectors
};