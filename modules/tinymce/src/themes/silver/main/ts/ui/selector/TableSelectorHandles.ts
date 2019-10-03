import { Button, Behaviour, Dragging, Unselecting, DragCoord, Attachment, GuiFactory } from "@ephox/alloy";
import { PlatformDetection } from '@ephox/sand';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Position, Element, Compare } from '@ephox/sugar';

// TODO: BEFORE THIS IS MERGED, THIS NEEDS TO BE IN THE TABLE PLUGIN SOMEHOW
import { TableLookup, OtherCells } from '@ephox/snooker';
import { InputHandlers, SelectionAnnotation } from '@ephox/darwin';

const setup = (editor, sink) => {
  const tlTds = Cell<any[]>([]);
  const brTds = Cell<any[]>([]);

  const getTopLeftSnaps = () => {
    return Arr.map(tlTds.get(), (td) => {
      const thisRect = td.dom().getBoundingClientRect();
      return Dragging.snap({
        sensor: DragCoord.fixed(thisRect.left, thisRect.top),
        range: Position(thisRect.width, thisRect.height),
        output: DragCoord.absolute(Option.some(thisRect.left), Option.some(thisRect.top)),
        extra: {
          td
        }
      });
    });
  };

  // TODO: Make the sensor snap to the bottom right by subtracting the width and height of the button from the output
  const getBottomRightSnaps = () => {
    return Arr.map(tlTds.get(), (td) => {
      const thisRect = td.dom().getBoundingClientRect();
      return Dragging.snap({
        sensor: DragCoord.fixed(thisRect.left, thisRect.top),
        range: Position(thisRect.width, thisRect.height),
        output: DragCoord.absolute(Option.some(thisRect.left + thisRect.width), Option.some(thisRect.top + thisRect.height)),
        extra: {
          td
        }
      });
    });
  };

  const topLeftSnaps = {
    getSnapPoints: getTopLeftSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      endCell.set(extra.td);
      const select = external.get();
      select(startCell.get(), endCell.get());
    },
    mustSnap: true
  };

  const bottomRightSnaps = {
    getSnapPoints: getTopLeftSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      endCell.set(extra.td);
      const select = external.get();
      select(startCell.get(), endCell.get());
    },
    mustSnap: true
  };

  const topLeftSketch = Button.sketch({
    dom: {
      tag: 'span',
      innerHtml: 'TL',
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

  const topLeft = GuiFactory.build(topLeftSketch);
  const selected = 'data-mce-selected';
  const selectedSelector = 'td[' + selected + '],th[' + selected + ']';
  // used with not selectors
  const attributeSelector = '[' + selected + ']';
  const firstSelected = 'data-mce-first-selected';
  const firstSelectedSelector = 'td[' + firstSelected + '],th[' + firstSelected + ']';
  const lastSelected = 'data-mce-last-selected';
  const lastSelectedSelector = 'td[' + lastSelected + '],th[' + lastSelected + ']';

  const ephemera = {
    selected: () => selected,
    selectedSelector: () => selectedSelector,
    attributeSelector: () => attributeSelector,
    firstSelected: () => firstSelected,
    firstSelectedSelector: () => firstSelectedSelector,
    lastSelected: () => lastSelected,
    lastSelectedSelector: () => lastSelectedSelector
  };

  const isRoot = (element) => {
    return Compare.eq(element, Element.fromDom(editor.getBody()));
  };

  const annotations = SelectionAnnotation.byAttr(ephemera);

  const external = Cell<any>(null);

  editor.on('init', () => {
    Attachment.attach(sink, topLeft);
    external.set(InputHandlers.external(editor.getWin(), Element.fromDom(editor.getBody()), isRoot, annotations));
  });

  const startCell = Cell<any>(null);
  const endCell = Cell<any>(null);

  editor.on('nodechange', () => {
    const startNode = Element.fromDom(editor.selection.getNode());
    startCell.set(startNode);
    endCell.set(startNode);
    const table = TableLookup.table(startNode);
    const tabTarget = {
      selection: () => [startNode]
    };
    table.each((tab) => {
      const ul = OtherCells.getUpOrLeft(tab, tabTarget);
      ul.each((upperLeftCells) => {
        tlTds.set(upperLeftCells);
        const snaps = getTopLeftSnaps();
        const lastSnap = snaps[snaps.length - 1];
        Dragging.snapTo(topLeft, lastSnap);
      });
    });
  });
};

export default {
  setup
};