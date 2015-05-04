define(
  'ephox.darwin.api.TableKeys',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.keyboard.Retries',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.darwin.navigation.BrTags',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.api.dom.DomParent',
    'ephox.scullion.ADT',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Rectangles, Retries, BeforeAfter, BrTags, PlatformDetection, WindowSelection, Awareness, Fun, Option, Spot, DomParent, Adt, Compare, SelectorFind) {
    var platform = PlatformDetection.detect();

    var adt = Adt.generate([
      { 'none' : [ 'message'] },
      { 'success': [ ] },
      { 'failedUp': [ 'cell' ] },
      { 'failedDown': [ 'cell' ] }
    ]);

    var findSpot = function (brMover, cursorMover, win, isRoot) {
      console.log('finding spot');
      return WindowSelection.get(win).bind(function (sel) {
        return brMover(win, isRoot, sel.finish(), sel.foffset()).fold(function () {
          console.log('>> Could not find an anchor for an initial br (or an initial br). Using box-hitting.');
          return Option.some(Spot.point(sel.finish(), sel.foffset()));
        }, function (brNeighbour) {
          var range = WindowSelection.deriveExact(win, brNeighbour);
          console.log('<< Found an anchor point for an initial br', range.finish().dom(), range.foffset());
          var failure = cursorMover === tryCursorDown ? BeforeAfter.adt.failedDown : BeforeAfter.adt.failedUp;
          var analysis = BeforeAfter.verify(sel.finish(), range.finish(), failure);
          return BrTags.process(analysis);
        });
      });
    };

    var handle = function (brMover, cursorMover, win, isRoot) {
      return findSpot(brMover, cursorMover, win, isRoot).bind(function (spot) {
        // There is a point to start doing box-hitting from
        return hacker(win, cursorMover, isRoot, spot.element(), spot.offset(), 1000).map(function (tgt) {
          return WindowSelection.deriveExact(win, tgt);
        });
      });
    };

    // Let's get some bounding rects, and see if they overlap (x-wise)
    var isOverlapping = function (a, b) {
      var bBounds = b.dom().getBoundingClientRect();
      var aBounds = a.dom().getBoundingClientRect();
      return bBounds.right > aBounds.left && bBounds.left < aBounds.right;
    };

    var typewriter = function (mover, result, element, offset) {
      // Identify the cells that the before and after are in.
      return SelectorFind.closest(result.start(), 'td,th').bind(function (newCell) {
        return SelectorFind.closest(element, 'td,th').map(function (oldCell) {
          // If they are not in the same cell
          if (! Compare.eq(newCell, oldCell)) {

            return DomParent.sharedOne(isRow, [ newCell, oldCell ]).fold(function () {
              // No shared row, and they overlap x-wise -> success, otherwise: failed
              return isOverlapping(oldCell, newCell) ? adt.success() : (mover === tryCursorDown ? adt.failedDown(oldCell) : adt.failedUp(oldCell));
            }, function (sharedRow) {
              // A shared row, but different cells, so the browser will be wrong. Try again.
              if (mover === tryCursorDown) return adt.failedDown(oldCell);
              else if (mover === tryCursorUp) return adt.failedUp(oldCell);
              else return adt.none('not right');
            });
          } else {
            // Note, there used to be two different types here: finishSection and startSection .. only finishSection (offset = end of result)
            // had different behaviour. They would be triggered when we were ending up (result) in a container than contained initial (element)
            return adt.none('in same cell');
          }
        });
      }).getOr(adt.none('default'));
    };

    var isRow = function (elem) {
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
        });
      });
    };


    var tryCursorDown = function (win, isRoot, element, offset) {
      return Rectangles.getBox(win, element, offset).bind(function (box) {
        if (platform.browser.isChrome() || platform.browser.isSafari()) return Retries.tryDown(win, box);
        else if (platform.browser.isFirefox()) return Retries.tryDown(win, box);
        else if (platform.browser.isIE()) return Retries.ieTryDown(win, box);
        else return Option.none();
      });
    };

    var tryCursorUp = function (win, isRoot, element, offset) {
      return Rectangles.getBox(win, element, offset).bind(function (box) {
        if (platform.browser.isChrome() || platform.browser.isSafari()) return Retries.tryUp(win, box);
        else if (platform.browser.isFirefox()) return Retries.tryUp(win, box);
        else if (platform.browser.isIE()) return Retries.ieTryUp(win, box);
        else return Option.none();
      });
    };

    var tryBrDown = function (win, isRoot, element, offset) {
      return BrTags.tryBrDown(win, isRoot, element, offset);
    };

    var tryBrUp = function (win, isRoot, element, offset) {
      return BrTags.tryBrUp(win, isRoot, element, offset);
    };

    return {
      handleUp: Fun.curry(handle, tryBrUp, tryCursorUp),
      handleDown: Fun.curry(handle, tryBrDown, tryCursorDown)
    };
  }
);