define(
  'ephox.darwin.api.Dogged',

  [
    'ephox.darwin.api.Beta',
    'ephox.darwin.api.TableKeys',
    'ephox.darwin.mouse.CellSelection',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Beta, TableKeys, CellSelection, PlatformDetection, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, Struct, Compare, SelectorFind) {
    var response = Struct.immutable('selection', 'kill');
    var detection = PlatformDetection.detect();

    var correctVertical = function (simulate, win, isRoot, element, offset) {
      // Ensure that it only operates in cells.
      return SelectorFind.closest(element, 'td,th').bind(function (_cell) {
        return simulate(win, isRoot, element, offset).map(function (range) {
          return response(
            Option.some(SelectionRange.write(
              Situ.on(range.start(), range.soffset()),
              Situ.on(range.finish(), range.foffset())
            )),
            true
          );
        });
      });
    };

    var correctShiftVertical = function (simulate, win, container, isRoot, element, offset) {
      // We are not in table selection mode, so predict the movement and see if we have to pick up the selection.
      return SelectorFind.closest(element, 'td,th').bind(function (startCell) {
        return simulate(win, isRoot, element, offset).bind(function (range) {
          return SelectorFind.closest(range.finish(), 'td,th').bind(function (finishCell) {
            // For a spanning selection, the cells must be different.
            if (! Compare.eq(startCell, finishCell)) {
              return CellSelection.identify(startCell, finishCell).map(function (boxes) {
                CellSelection.selectRange(container, boxes, startCell, finishCell);
                return response(
                  Option.some(SelectionRange.write(Situ.on(element, offset), Situ.on(element, offset))),
                  true
                );
              });
            } else {
              return Option.none();
            }
          });
        });
      });
    };

    // Pressing left or right (without shift) clears any table selection and lets the browser handle it.
    var clearToNavigate = function (win, container/*, _isRoot, _element, _offset*/) {
      Beta.clearSelection(container);
      return Option.none();
    };

    var handleVertical = function (simulate, win, container, isRoot, element, offset) {
      return CellSelection.retrieve(container).fold(function () {
        // On Webkit, we need to handle this.
        return detection.browser.isSafari() || detection.browser.isChrome() ? correctVertical(simulate, win, isRoot, element, offset) : Option.none();
      }, function (selected) {
        return clearToNavigate(win, container, isRoot, element, offset);
      });
    };

    var handleShiftHorizontal = function (shifter, win, container/*, _isRoot, _element, _offset*/) {
      return CellSelection.retrieve(container).bind(function (selected) {
        return shifter(container, selected).map(function () {
          return response(Option.none(), true);
        }).orThunk(function () {
          return Option.some(response(Option.none(), true));
        });
      });
    };

    var handleShiftVertical = function (simulate, shifter, rows, cols, win, container, isRoot, element, offset) {
      return CellSelection.retrieve(container).fold(function () {
        return detection.browser.isSafari() || detection.browser.isChrome() ? correctShiftVertical(simulate, win, container, isRoot, element, offset) : Option.none();
      }, function (selected) {
        // Expanding the selection.
        return shifter(container, selected).map(function () {
          return response(Option.none(), true);
        }).orThunk(function () {
          return Option.some(response(Option.none(), true));
        });
      });
    };

    var syncSelection = function (win, container, isRoot, start, soffset, finish, foffset) {
      if (! WindowSelection.isCollapsed(start, soffset, finish, foffset)) {
        return SelectorFind.closest(start, 'td,th').bind(function (s) {
          return SelectorFind.closest(finish, 'td,th').bind(function (f) {
            if (! Compare.eq(s, f)) {
              var boxes = CellSelection.identify(s, f).getOr([]);
              if (boxes.length > 0) {
                CellSelection.selectRange(container, boxes, s, f);
                WindowSelection.setExact(win, s, 0, s, Awareness.getEnd(s));
                return Option.some(response(
                  Option.some(SelectionRange.write(Situ.on(s, 0), Situ.on(s, Awareness.getEnd(s)))),
                  true
                ));
              } else {
                return Option.none();
              }
            } else {
              return Option.none();
            }
          });
        });
      } else {
        return Option.none();
      }
    };

    var releaseShift = function (win, container, isRoot, start, soffset, finish, foffset) {
      return CellSelection.retrieve(container).fold(function () {
        return syncSelection(win, container, isRoot, start, soffset, finish, foffset);
      }, Option.none);
    };

    return {
      shiftLeft: Fun.curry(handleShiftHorizontal, Beta.shiftLeft),
      shiftRight: Fun.curry(handleShiftHorizontal, Beta.shiftRight),
      shiftUp: Fun.curry(handleShiftVertical, TableKeys.handleUp, Beta.shiftUp, -1, 0),
      shiftDown: Fun.curry(handleShiftVertical, TableKeys.handleDown, Beta.shiftDown, +1, 0),

      left: clearToNavigate,
      right: clearToNavigate,
      up: Fun.curry(handleVertical, TableKeys.handleUp),
      down: Fun.curry(handleVertical, TableKeys.handleDown),

      retrieve: CellSelection.retrieve,

      releaseShift: releaseShift
    };
  }
);