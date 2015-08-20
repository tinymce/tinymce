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
    // Based on a start and finish, select the appropriate box of cells
    var sync = function (container, isRoot, start, soffset, finish, foffset) {
      console.log('syncing');
      if (! WindowSelection.isCollapsed(start, soffset, finish, foffset)) {
        return SelectorFind.closest(start, 'td,th').bind(function (s) {
          return SelectorFind.closest(finish, 'td,th').bind(function (f) {
            console.log('detecting');
            return detect(container, isRoot, s, f);
          });
        });
      } else {
        return Option.none();
      }
    };

    // If the cells are different, and there is a rectangle to connect them, select the cells.
    var detect = function (container, isRoot, start, finish) {
      if (! Compare.eq(start, finish)) {
        var boxes = CellSelection.identify(start, finish).getOr([]);
        if (boxes.length > 0) {
          CellSelection.selectRange(container, boxes, start, finish);
          return Option.some(Responses.response(
            Option.some(SelectionRange.write(Situ.on(start, 0), Situ.on(start, Awareness.getEnd(start)))),
            true
          ));
        }
      }

      return Option.none();
    };

    var update = function (rows, columns, container, selected) {
      var updateSelection = function (newSels) {
        CellSelection.clear(container);
        CellSelection.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
        return newSels.boxes();
      };

      return CellSelection.shiftSelection(selected, rows, columns).map(updateSelection);
    };

    return {
      sync: sync,
      detect: detect,
      update: update
    };
  }
);