import { Button, Behaviour, Dragging, Unselecting, DragCoord, Attachment, GuiFactory } from "@ephox/alloy";
import { PlatformDetection } from '@ephox/sand';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Attr, Position, Element } from '@ephox/sugar';

// TODO: BEFORE THIS IS MERGED, THIS NEEDS TO BE IN THE TABLE PLUGIN SOMEHOW
import { TableLookup, OtherCells } from '@ephox/snooker';

const setup = (editor, sink) => {
  const tlTds = Cell<any[]>([]);

  const getTopLeftSnaps = () => {
    return Arr.map(tlTds.get(), (td) => {
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

  const spec = {
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
  };

  const topLeftSketch = Button.sketch(spec);

  const topLeft = GuiFactory.build(topLeftSketch);

  editor.on('init', () => {
    Attachment.attach(sink, topLeft);
  });

  editor.on('nodechange', () => {
    const startNode = Element.fromDom(editor.selection.getNode());
    const table = TableLookup.table(startNode);
    const tabTarget = {
      selection: () => [startNode]
    };
    table.each((tab) => {
      const ul = OtherCells.getUpOrLeft(tab, tabTarget);
      ul.each((upperLeftCells) => {
        tlTds.set(upperLeftCells);
        // console.log(upperLeftCells);
        console.log(Dragging);
        Dragging.snapTo(topLeft, 1);
      });
    });
  });
};

export default {
  setup
};