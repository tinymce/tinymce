import { Singleton } from '@ephox/katamari';
import { Compare, EventArgs, SelectorFind, SugarElement } from '@ephox/sugar';
import { SelectionAnnotation } from '../api/SelectionAnnotation';
import { WindowBridge } from '../api/WindowBridge';
import * as CellSelection from '../selection/CellSelection';

const findCell = (target: SugarElement, isRoot: (e: SugarElement) => boolean) =>
  SelectorFind.closest(target, 'td,th', isRoot);

export default (bridge: WindowBridge, container: SugarElement, isRoot: (e: SugarElement) => boolean, annotations: SelectionAnnotation) => {
  const cursor = Singleton.value<SugarElement>();
  const clearstate = cursor.clear;

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mousedown = (event: EventArgs) => {
    annotations.clear(container);
    findCell(event.target, isRoot).each(cursor.set);
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mouseover = (event: EventArgs) => {
    cursor.on((start) => {
      annotations.clearBeforeUpdate(container);
      findCell(event.target, isRoot).each((finish) => {
        CellSelection.identify(start, finish, isRoot).each((cellSel) => {
          const boxes = cellSel.boxes.getOr([]);
          // Wait until we have more than one, otherwise you can't do text selection inside a cell.
          // Alternatively, if the one cell selection starts in one cell and ends in a different cell,
          // we can assume that the user is trying to make a one cell selection in two different tables which should be possible.
          if (boxes.length > 1 || (boxes.length === 1 && !Compare.eq(start, finish))) {
            annotations.selectRange(container, boxes, cellSel.start, cellSel.finish);

            // stop the browser from creating a big text selection, select the cell where the cursor is
            bridge.selectContents(finish);
          }
        });
      });
    });
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mouseup = (_event?: EventArgs) => {
    clearstate();
  };

  return {
    clearstate,
    mousedown,
    mouseover,
    mouseup
  };
};
