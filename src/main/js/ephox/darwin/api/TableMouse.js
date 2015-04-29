define(
  'ephox.darwin.api.TableMouse',

  [
    'ephox.darwin.mouse.CellSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind'
  ],

  function (CellSelection, Fun, Option, SelectorFind) {
    return function (container) {
      var cursor = Option.none();

      var mousedown = function (event) {
        if (event.raw().button !== 0) return;
        cursor = SelectorFind.closest(event.target(), 'td,th');
        CellSelection.clear(container);
      };

      var mouseover = function (event) {
        cursor.each(function (start) {
          console.log('start', start.dom());
          CellSelection.clear(container);
          var finish = SelectorFind.closest(event.target(), 'td,th');
          var boxes = finish.bind(Fun.curry(CellSelection.identify, start)).getOr([]);
          console.log('boxes', boxes);
          if (boxes.length > 0) {
            CellSelection.select(boxes);
            window.getSelection().removeAllRanges();
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