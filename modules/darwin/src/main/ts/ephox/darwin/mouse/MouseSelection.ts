import { Option } from '@ephox/katamari';
import { Compare, SelectorFind, Element, EventArgs } from '@ephox/sugar';
import * as CellSelection from '../selection/CellSelection';
import { WindowBridge } from '../api/WindowBridge';
import { SelectionAnnotation } from '../api/SelectionAnnotation';

const findCell = function (target: Element, isRoot: (e: Element) => boolean) {
  return SelectorFind.closest(target, 'td,th', isRoot);
};

export default function (bridge: WindowBridge, container: Element, isRoot: (e: Element) => boolean, annotations: SelectionAnnotation) {
  let cursor: Option<Element> = Option.none();
  const clearState = function () {
    cursor = Option.none();
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mousedown = function (event: EventArgs) {
    annotations.clear(container);
    cursor = findCell(event.target(), isRoot);
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  const mouseover = function (event: EventArgs) {
    cursor.each(function (start) {
      annotations.clearBeforeUpdate(container);
      findCell(event.target(), isRoot).each(function (finish) {
        CellSelection.identify(start, finish, isRoot).each(function (cellSel) {
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
  const mouseup = function (_event?: EventArgs) {
    cursor.each(clearState);
  };

  return {
    mousedown,
    mouseover,
    mouseup
  };
}
