define(
  'ephox.darwin.keyboard.TableKeys',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.darwin.navigation.BrTags',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.scullion.ADT'
  ],

  function (Rectangles, BeforeAfter, BrTags, PlatformDetection, WindowSelection, Awareness, Option, Spot, Adt) {
    var platform = PlatformDetection.detect();

    var adt = Adt.generate([
      { 'none' : [ 'message'] },
      { 'success': [ ] },
      { 'failedUp': [ 'cell' ] },
      { 'failedDown': [ 'cell' ] }
    ]);

    var findSpot = function (win, isRoot, direction) {
      return WindowSelection.get(win).bind(function (sel) {
        return BrTags.tryBr(win, isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
          return Option.some(Spot.point(sel.finish(), sel.foffset()));
        }, function (brNeighbour) {
          var range = WindowSelection.deriveExact(win, brNeighbour);
          var analysis = BeforeAfter.verify(sel.finish(), range.finish(), direction.failure);
          return BrTags.process(analysis);
        });
      });
    };

    var scan = function (win, isRoot, element, offset, direction, counter) {
      if (counter === 0) return Option.none();
      // Firstly, move the (x, y) and see what element we end up on.
      return tryCursor(win, isRoot, element, offset, direction).bind(function (next) {
        var range = WindowSelection.deriveExact(win, next);
        // Now, check to see if the element is a new cell.
        var analysis = BeforeAfter.verify(element, range.finish(), direction.failure);
        return BeforeAfter.cata(analysis, function () {
          return Option.none();
        }, function () {
          // We have a new cell, so we stop looking.
          return Option.some(next);
        }, function (cell) {
          // We need to look again from the start of our current cell
          return scan(win, isRoot, cell, 0, direction, counter - 1);
        }, function (cell) {
          // We need to look again from the end of our current cell
          return scan(win, isRoot, cell, Awareness.getEnd(cell), direction, counter - 1);
        });
      });
    };

    var tryCursor = function (win, isRoot, element, offset, direction) {
      return Rectangles.getBox(win, element, offset).bind(function (box) {
        if (platform.browser.isChrome() || platform.browser.isSafari()) return direction.otherRetry(win, box);
        else if (platform.browser.isFirefox()) return direction.otherRetry(win, box);
        else if (platform.browser.isIE()) return direction.ieRetry(win, box);
        else return Option.none();
      });
    };

    var handle = function (win, isRoot, direction) {
      return findSpot(win, isRoot, direction).bind(function (spot) {
        // There is a point to start doing box-hitting from
        return scan(win, isRoot, spot.element(), spot.offset(), direction, 1000).map(function (tgt) {
          return WindowSelection.deriveExact(win, tgt);
        });
      });
    };

    return {
      handle: handle
    };
  }
);