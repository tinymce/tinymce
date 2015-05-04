define(
  'ephox.darwin.keyboard.KeySelection',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.selection.CellSelection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Responses, CellSelection, SelectionRange, Situ, WindowSelection, Awareness, Option, Compare, SelectorFind) {
    var sync = function (win, container, isRoot, start, finish) {
      if (! WindowSelection.isCollapsed(start, soffset, finish, foffset)) {
        return SelectorFind.closest(start, 'td,th').bind(function (s) {
          return SelectorFind.closest(finish, 'td,th').bind(function (f) {
            return detect(win,container, isRoot, start, s, f);
          });
        });
      } else {
        return Option.none();
      }
    };

    // If the cells are different, and there is a rectangle to connect them, select the cells.
    var detect = function (win, container, isRoot, start, finish) {
      if (! Compare.eq(start, finish)) {
        var boxes = CellSelection.identify(s, f).getOr([]);
        if (boxes.length > 0) {
          CellSelection.selectRange(container, boxes, s, f);
          return Option.some(Responses.response(
            Option.some(SelectionRange.write(Situ.on(s, 0), Situ.on(s, Awareness.getEnd(s)))),
            true
          ));
        }
      }

      return Option.none();
    };

    var update = function (rows, columns, container, selected) {
      var update = function (newSels) {
        CellSelection.clear(container);
        CellSelection.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
        return newSels.boxes();
      };

      return CellSelection.shiftSelection(selected, rows, columns).map(update);
    };

    return {
      sync: sync,
      detect: detect,
      update: update
    };
  }
);