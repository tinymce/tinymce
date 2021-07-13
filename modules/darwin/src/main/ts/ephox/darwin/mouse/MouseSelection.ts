import { Optional, Singleton } from '@ephox/katamari';
import { EventArgs, SelectorFind, SugarElement } from '@ephox/sugar';

import { SelectionAnnotation } from '../api/SelectionAnnotation';
import { WindowBridge } from '../api/WindowBridge';
import * as CellSelection from '../selection/CellSelection';

export interface MouseSelection {
  readonly clearstate: () => void;
  readonly mousedown: (event: EventArgs<MouseEvent>) => void;
  readonly mouseover: (event: EventArgs<MouseEvent>) => void;
  readonly mouseup: (event: EventArgs<MouseEvent>) => void;
}

const findCell = (target: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean): Optional<SugarElement<HTMLTableCellElement>> =>
  SelectorFind.closest<HTMLTableCellElement>(target, 'td,th', isRoot);

export const MouseSelection = (bridge: WindowBridge, container: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean, annotations: SelectionAnnotation): MouseSelection => {
  const cursor = Singleton.value<SugarElement<HTMLTableCellElement>>();
  const clearstate = cursor.clear;

  const applySelection = (event: EventArgs<MouseEvent>) => {
    cursor.on((start) => {
      annotations.clearBeforeUpdate(container);
      findCell(event.target, isRoot).each((finish) => {
        CellSelection.identify(start, finish, isRoot).each((cellSel) => {
          const boxes = cellSel.boxes.getOr([]);
          // Wait until we have more than one, otherwise you can't do text selection inside a cell.
          if (boxes.length > 1) {
            annotations.selectRange(container, boxes, cellSel.start, cellSel.finish);

            // stop the browser from creating a big text selection, select the cell where the cursor is
            bridge.selectContents(finish);
          }
        });
      });
    });
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mousedown = (event: EventArgs<MouseEvent>) => {
    annotations.clear(container);
    findCell(event.target, isRoot).each(cursor.set);
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mouseover = (event: EventArgs<MouseEvent>) => {
    applySelection(event);
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mouseup = (event: EventArgs<MouseEvent>) => {
    // Needed as Firefox will change the selection between the mouseover and mouseup when selecting
    // just 2 cells as Firefox supports multiple selection ranges
    applySelection(event);
    clearstate();
  };

  return {
    clearstate,
    mousedown,
    mouseover,
    mouseup
  };
};
