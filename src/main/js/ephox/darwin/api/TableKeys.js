define(
  'ephox.darwin.api.TableKeys',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.keyboard.Retries',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.Situ',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.robin.api.dom.DomParent',
    'ephox.scullion.ADT',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateExists',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Rectangles, Retries, PlatformDetection, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, DomGather, DomParent, Adt, Compare, Node, PredicateExists, SelectorFind, Traverse) {
    var platform = PlatformDetection.detect();

    var adt = Adt.generate([
      { 'none' : [ 'message'] },
      { 'success': [ ] },
      { 'failedUp': [ 'cell' ] },
      { 'failedDown': [ 'cell' ] },
      { 'startSection' : [ 'section' ] },
      { 'finishSection': [ 'section' ] }
    ]);

    var handle = function (brMover, cursorMover, win, isRoot) {
      return WindowSelection.get(win).bind(function (sel) {
        return brMover(win, isRoot, sel.finish(), sel.foffset()).fold(function () {
          return hacker(win, cursorMover, isRoot, sel.finish(), sel.foffset(), 1000);
        }, function (next) {
          var exact = WindowSelection.deriveExact(win, next);
          return typewriter(cursorMover, exact, sel.finish(), sel.foffset()).fold(function (message) {
            return Option.none('BR ADT: none');
          }, function () {
            return Option.none('BR ADT: success');
          }, function (cell) {
            return hacker(win, cursorMover, isRoot, cell, 0, 1000);
          }, function (cell) {
            return hacker(win, cursorMover, isRoot, cell, Awareness.getEnd(cell), 1000);
          }, function (section) {
            return Option.none('BR ADT: retry because moved to start of outer container');
          }, function (section) {
            return Option.none('BR ADT: retry because moved to finish of outer container');
          });
        }).map(function (next) {
          return WindowSelection.deriveExact(win, next);
        });
      });
    };

    var typewriter = function (mover, result, element, offset) {
      // Identify the cells that the before and after are in.
      return SelectorFind.closest(result.start(), 'td,th').bind(function (newCell) {
        return SelectorFind.closest(element, 'td,th').map(function (oldCell) {
          // If they are not in the same cell
          if (! Compare.eq(newCell, oldCell)) {

            return DomParent.sharedOne(isRow, [ newCell, oldCell ]).fold(function () {
              // And they are not in the same row, all good.
              return adt.success();
            }, function (sharedRow) {
              // Same row, different cell (failure): We are moving down, so try the end of the original cell
              // if (mover === tryCursorDown && offset < Awareness.getEnd(oldCell)) return adt.failedDown(oldCell);
              // else if (mover === tryCursorUp && offset > 0) return adt.failedUp(oldCell);
              // else return adt.none('same row, different cell, at edge: ' + offset + ' of (0, ' + Awareness.getEnd(oldCell) + ')');

              if (mover === tryCursorDown) return adt.failedDown(oldCell);
              else if (mover === tryCursorUp) return adt.failedUp(oldCell);
              else return adt.none('not right');
            });
          } else {
            var inNewPosition = PredicateExists.ancestor(element, function (elem) {
              return Compare.eq(elem, result.start());
            });

            // If we have moved to the containing cell.
            // Note, will have to put (AND LAST POSITION) here, otherwise br tags will be skipped (May have already been done)
            if (inNewPosition && mover === tryCursorDown && result.soffset() === Awareness.getEnd(result.start())) return adt.finishSection(result.start());
            else if (inNewPosition && mover === tryCursorUp && result.soffset() === 0) return adt.startSection(result.start());
            else return adt.none('same cell, not within result + at edge');
          }
        });
      }).getOr(adt.none('default'));
    };

    var isRow = function (elem) {
      return SelectorFind.closest(elem, 'tr');
      return SelectorFind.closest(elem, 'tr');
    };

    var hacker = function (win, mover, isRoot, element, offset, counter) {
      if (counter === 0) return Option.none();
      return mover(win, isRoot, element, offset).bind(function (next) {

        var exact = WindowSelection.deriveExact(win, next);

        return typewriter(mover, exact, element, offset).fold(function () {
          return Option.none('ADT: none');
        }, function () {
          return Option.some(next);
        }, function (cell) {
          return hacker(win, mover, isRoot, cell, 0, counter - 1);
        }, function (cell) {
          return hacker(win, mover, isRoot, cell, Awareness.getEnd(cell), counter - 1);
        }, function (section) {
          return Option.none('ADT: retry because moved to start of outer container :: CANCELLED');
        }, function (section) {
          return hacker(win, mover, isRoot, section, Awareness.getEnd(section), counter - 1);
        });
      });
    };


    var tryCursorDown = function (win, isRoot, element, offset) {
      return Rectangles.getBox(win, element, offset).bind(function (box) {
        if (platform.browser.isChrome() || platform.browser.isSafari()) return Retries.tryDown(window, box);
        else if (platform.browser.isFirefox()) return Retries.tryDown(window, box);
        else if (platform.browser.isIE()) return Retries.ieTryDown(window, box);
        else return Option.none();
      });
    };

    var tryCursorUp = function (win, isRoot, element, offset) {
      return Rectangles.getBox(win, element, offset).bind(function (box) {
        if (platform.browser.isChrome() || platform.browser.isSafari()) return Retries.tryUp(window, box);
        else if (platform.browser.isFirefox()) return Retries.tryUp(window, box);
        else if (platform.browser.isIE()) return Retries.ieTryUp(window, box);
        else return Option.none();
      });
    };

    var isBr = function (elem) {
      return Node.name(elem) === 'br';
    };

    var tryBr = function (win, isRoot, element, offset, gather, situ) {
      var candidate = isBr(element) ? Option.some(element) : Traverse.child(element, offset).filter(isBr).orThunk(function () {
        // Can be either side of the br, and still be a br.
        return Traverse.child(element, offset-1).filter(isBr);
      });

      return candidate.bind(function (cand) {
        return gather(cand, isRoot).map(function (target) {
          return SelectionRange.write(
            situ(target),
            situ(target)
          );
        });
      });
    };

    var tryBrDown = function (win, isRoot, element, offset) {
      return tryBr(win, isRoot, element, offset, DomGather.after, Situ.before);
    };

    var tryBrUp = function (win, isRoot, element, offset) {
      return tryBr(win, isRoot, element, offset, DomGather.before, Situ.after);
    };

    return {
      handleUp: Fun.curry(handle, tryBrUp, tryCursorUp),
      handleDown: Fun.curry(handle, tryBrDown, tryCursorDown)
    };
  }
);