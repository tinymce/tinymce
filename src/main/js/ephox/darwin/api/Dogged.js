define(
  'ephox.darwin.api.Dogged',

  [
    'ephox.darwin.api.Beta',
    'ephox.darwin.api.TableKeys',
    'ephox.darwin.mouse.CellSelection',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Beta, TableKeys, CellSelection, PlatformDetection, SelectionRange, Situ, Fun, Option, Struct, Compare, SelectorFind) {
    var response = Struct.immutable('selection', 'kill');
    var detection = PlatformDetection.detect();

    var correctVertical = function (simulate, win, isRoot, element, offset) {
      return simulate(win, isRoot, element, offset).map(function (range) {
        return response(
          Option.some(SelectionRange.write(
            Situ.on(range.start(), range.soffset()),
            Situ.on(range.finish(), range.foffset())
          )),
          true
        );
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
        return clearToNavigate(container);
      });
    };

    var handleShiftHorizontal = function (shifter, win, container/*, _isRoot, _element, _offset*/) {
      return CellSelection.retrieve(container).bind(function (selected) {
        return shifter(container, selected).map(function () {
          return response(Option.none(), true);
        });
      });
    };

    var handleShiftVertical = function (simulate, shifter, rows, cols, win, container, isRoot, element, offset) {
      return CellSelection.retrieve(container).fold(function () {
        // We are not in table selection mode, so predict the movement and see if we have to pick up the selection.
        return simulate(win, isRoot, element, offset).bind(function (range) {
          return SelectorFind.closest(element, 'td,th').bind(function (startCell) {
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
          // I used to do something here about setting the selection to the range. May need to do that later.
        });
      }, function (selected) {
        // Expanding the selection.
        return shifter(container, selected).map(function () {
          return response(Option.none(), true);
        });
      });
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
    };
  }
);