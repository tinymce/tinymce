import CellSelection from '../selection/CellSelection';
import { Option } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';

var findCell = function (target, isRoot) {
  return SelectorFind.closest(target, 'td,th', isRoot);
};

export default <any> function (bridge, container, isRoot, annotations) {
  var cursor = Option.none();
  var clearState = function () {
    cursor = Option.none();
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  var mousedown = function (event) {
    annotations.clear(container);
    cursor = findCell(event.target(), isRoot);
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  var mouseover = function (event) {
    cursor.each(function (start) {
      annotations.clear(container);
      findCell(event.target(), isRoot).each(function (finish) {
        CellSelection.identify(start, finish, isRoot).each(function (cellSel) {
          var boxes = cellSel.boxes().getOr([]);
          // Wait until we have more than one, otherwise you can't do text selection inside a cell.
          // Alternatively, if the one cell selection starts in one cell and ends in a different cell,
          // we can assume that the user is trying to make a one cell selection in two different tables which should be possible.
          if (boxes.length > 1 || (boxes.length === 1 && !Compare.eq(start, finish))) {
            annotations.selectRange(container, boxes, cellSel.start(), cellSel.finish());

            // stop the browser from creating a big text selection, select the cell where the cursor is
            bridge.selectContents(finish);
          }
        });
      });
    });
  };

  /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
  var mouseup = function () {
    cursor.each(clearState);
  };

  return {
    mousedown: mousedown,
    mouseover: mouseover,
    mouseup: mouseup
  };
};