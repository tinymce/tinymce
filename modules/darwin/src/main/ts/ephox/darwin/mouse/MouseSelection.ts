import { Optional, Optionals, Singleton } from '@ephox/katamari';
import { Compare, ContentEditable, EventArgs, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

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

const isInEditableContext = (cell: SugarElement<HTMLTableCellElement>) =>
  Traverse.parentElement(cell).exists(ContentEditable.isEditable);

export const MouseSelection = (bridge: WindowBridge, container: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean, annotations: SelectionAnnotation): MouseSelection => {
  const cursor = Singleton.value<SugarElement<HTMLTableCellElement>>();
  const clearstate = cursor.clear;

  const applySelection = (event: EventArgs<MouseEvent>) => {
    cursor.on((start) => {
      annotations.clearBeforeUpdate(container);
      findCell(event.target, isRoot).each((finish) => {
        CellSelection.identify(start, finish, isRoot).each((cellSel) => {
          const boxes = cellSel.boxes.getOr([]);
          if (boxes.length === 1) {
            // If a single noneditable cell is selected and the actual selection target within the cell
            // is also noneditable, make sure it is annotated
            const singleCell = boxes[0];
            const isNonEditableCell = ContentEditable.getRaw(singleCell) === 'false';
            const isCellClosestContentEditable = Optionals.is(ContentEditable.closest(event.target), singleCell, Compare.eq);
            if (isNonEditableCell && isCellClosestContentEditable) {
              annotations.selectRange(container, boxes, singleCell, singleCell);
              // TODO: TINY-7874 This is purely a workaround until the offscreen selection issues are solved
              bridge.selectContents(singleCell);
            }
          } else if (boxes.length > 1) {
            // Wait until we have more than one, otherwise you can't do text selection inside a cell.
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
    findCell(event.target, isRoot).filter(isInEditableContext).each(cursor.set);
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
