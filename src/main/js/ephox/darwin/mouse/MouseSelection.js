define(
  'ephox.darwin.mouse.MouseSelection',

  [
    'ephox.darwin.selection.CellSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (CellSelection, Fun, Option, SelectorFind, Traverse) {
    return function (container) {
      var cursor = Option.none();

      var mousedown = function (event) {
        if (event.raw().button !== 0) return;
        cursor = SelectorFind.closest(event.target(), 'td,th');
        CellSelection.clear(container);
      };

      var mouseover = function (event) {
        cursor.each(function (start) {
          CellSelection.clear(container);
          var finish = SelectorFind.closest(event.target(), 'td,th');
          var boxes = finish.bind(Fun.curry(CellSelection.identify, start)).getOr([]);
          if (boxes.length > 0) {
            CellSelection.selectRange(container, boxes, start, finish.getOrDie());

            // Do this elsewhere. Fussy should have a remove all ranges method.
            Traverse.defaultView(container).dom().getSelection().removeAllRanges();
          }
        });
      };

      var mouseup = function (event) {
        cursor = Option.none();
      };

      return {
        mousedown: mousedown,
        mouseover: mouseover,
        mouseup: mouseup
      };
    };
  }
);