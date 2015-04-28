define(
  'ephox.darwin.api.TableKeys',

  [
    'ephox.darwin.api.Darwin',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.robin.api.dom.DomParent',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Darwin, WindowSelection, Awareness, Fun, Option, DomParent, Compare, SelectorFind) {
    var handle = function (mover, win, isRoot) {
      return WindowSelection.get(win).bind(function (sel) {
        return hacker(win, mover, isRoot, sel.finish(), sel.foffset()).map(function (next) {
          return WindowSelection.deriveExact(win, next);
        });
      });
    };

    var isRow = function (elem) {
      return SelectorFind.closest(elem, 'tr');
    };

    var hacker = function (win, mover, isRoot, element, offset) {
      return mover(win, isRoot, element, offset).bind(function (next) {
        var exact = WindowSelection.deriveExact(win, next);
          // Note, this will only work if we are staying in a table.
        return SelectorFind.closest(exact.start(), 'td,th').bind(function (newCell) {
          return SelectorFind.closest(element, 'td,th').bind(function (oldCell) {
            if (! Compare.eq(newCell, oldCell)) {
              return DomParent.sharedOne(isRow, [ newCell, oldCell ]).fold(function () {
                return Option.some(next);
              }, function (sharedRow) {
                return hacker(win, mover, isRoot, oldCell, mover === Darwin.tryDown ? Awareness.getEnd(oldCell) : 0);
              });
            } else {
              return Option.none();
            }
          });
        });
      });
    };

    return {
      handleUp: Fun.curry(handle, Darwin.tryUp),
      handleDown: Fun.curry(handle, Darwin.tryDown)
    };
  }
);