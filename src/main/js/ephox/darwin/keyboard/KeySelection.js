define(
  'ephox.darwin.keyboard.KeySelection',

  [
    'ephox.darwin.api.Responses',
    'ephox.darwin.selection.CellSelection',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.selection.Awareness',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.Situ'
  ],

  function (Responses, CellSelection, Fun, Option, Compare, SelectorFind, Awareness, Selection, Situ) {
    // Based on a start and finish, select the appropriate box of cells
    var sync = function (container, isRoot, start, soffset, finish, foffset, selectRange) {
      if (!(Compare.eq(start, finish) && soffset === foffset)) {
        return SelectorFind.closest(start, 'td,th', isRoot).bind(function (s) {
          return SelectorFind.closest(finish, 'td,th', isRoot).bind(function (f) {
            return detect(container, isRoot, s, f, selectRange);
          });
        });
      } else {
        return Option.none();
      }
    };

    /*
     * Before: (...) -> Option (Response (Option { start(): Situ, finish(): Situ })))
     *
     * After (...) -> Same.
     */

    // If the cells are different, and there is a rectangle to connect them, select the cells.
    var detect = function (container, isRoot, start, finish, selectRange) {
      if (! Compare.eq(start, finish)) {
        var boxes = CellSelection.identify(start, finish, isRoot).getOr([]);
        if (boxes.length > 0) {
          selectRange(container, boxes, start, finish);
          return Option.some(Responses.response(
            // INVESTIGATE
            Option.some({
              start: Fun.constant(Situ.on(start, 0)),
              finish: Fun.constant(Situ.on(start, Awareness.getEnd(start)))
            }),
            true
          ));
        }
      }

      return Option.none();
    };

    var update = function (rows, columns, container, selected, annotations) {
      var updateSelection = function (newSels) {
        annotations.clear(container);
        annotations.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
        return newSels.boxes();
      };

      return CellSelection.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(updateSelection);
    };

    return {
      sync: sync,
      detect: detect,
      update: update
    };
  }
);