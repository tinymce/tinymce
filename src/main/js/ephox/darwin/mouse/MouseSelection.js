define(
  'ephox.darwin.mouse.MouseSelection',

  [
    'ephox.darwin.selection.CellSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (CellSelection, Fun, Option, Compare, SelectorFind) {
    var findCell = function (target) {
      return SelectorFind.closest(target, 'td,th');
    };

    return function (bridge, container) {
      var cursor = Option.none();
      var clearState = function () {
        cursor = Option.none();
      };

      /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
      var mousedown = function (event) {
        CellSelection.clear(container);
        cursor = findCell(event.target());
      };

      /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
      var mouseover = function (event) {
        cursor.each(function (start) {
          CellSelection.clear(container);
          findCell(event.target()).each(function (finish) {
            var boxes = CellSelection.identify(start, finish).getOr([]);
            // Wait until we have more than one, otherwise you can't do text selection inside a cell.
            // Alternatively, if the one cell selection starts in one cell and ends in a different cell,
            // we can assume that the user is trying to make a one cell selection in two different tables which should be possible.
            if (boxes.length > 1 || (boxes.length === 1 && !Compare.eq(start, finish))) {
              CellSelection.selectRange(container, boxes, start, finish);

              // stop the browser from creating a big text selection, select the cell where the cursor is
              bridge.selectContents(finish);
            }
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
  }
);