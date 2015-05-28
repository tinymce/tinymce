define(
  'ephox.darwin.mouse.MouseSelection',

  [
    'ephox.compass.Arr',
    'ephox.darwin.selection.CellSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.sugar.api.ElementFind',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, CellSelection, Awareness, Fun, Option, Spot, ElementFind, SelectorFind) {
    return function (bridge, container) {
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
            bridge.clearSelection();
          }
        });
      };

      // Identify the range of contiguous cells from a starting point. Does not keep bias.
      var connected = function (start) {
        return ElementFind.inAncestorOfSelector(start, 'table', 'td,th').map(function (info) {
          var others = info.descendants().slice(info.index());
          var index = Arr.findIndex(others, Fun.not(CellSelection.isSelected));
          var finishCell = index > 0 ? others[index - 1] : others[others.length - 1];
          return Spot.point(finishCell, Awareness.getEnd(finishCell));
        });
      };

      var mouseup = function (event) {
        CellSelection.retrieve(container).each(function (cells) {
          connected(cells[0]).each(function (finish) {
            bridge.setSelection(cells[0], 0, finish.element(), finish.offset());
          });
        });

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