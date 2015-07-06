define(
  'ephox.darwin.mouse.MouseSelection',

  [
    'ephox.darwin.selection.CellSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind'
  ],

  function (CellSelection, Fun, Option, SelectorFind) {
    return function (bridge, container) {
      var cursor = Option.none();
      var clearState = function () {
        cursor = Option.none();
      };

      /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
      var mousedown = function (event) {
        CellSelection.clear(container);
        cursor = SelectorFind.closest(event.target(), 'td,th');
        cursor.each(storeInitialSelection);
      };

      /* Keep this as lightweight as possible when we're not in a table selection, it runs constantly */
      var mouseover = function (event) {
        cursor.each(function (start) {
          CellSelection.clear(container);
          var finish = SelectorFind.closest(event.target(), 'td,th');
          var boxes = finish.bind(Fun.curry(CellSelection.identify, start)).getOr([]);
          // Wait until we have more than one, otherwise you can't do text selection inside a cell.
          if (boxes.length > 1) {
            var mouseCell = finish.getOrDie();
            CellSelection.selectRange(container, boxes, start, mouseCell);

            // stop the browser from creating a big text selection, select the cell where the cursor is
            bridge.selectContents(mouseCell);
          }
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