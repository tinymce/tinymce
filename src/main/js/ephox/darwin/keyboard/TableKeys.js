define(
  'ephox.darwin.keyboard.TableKeys',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.darwin.navigation.BrTags',
    'ephox.fred.PlatformDetection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot'
  ],

  function (Rectangles, BeforeAfter, BrTags, PlatformDetection, Awareness, Option, Spot) {
    var MAX_RETRIES = 1000;

    var platform = PlatformDetection.detect();

    var findSpot = function (bridge, isRoot, direction) {
      return bridge.getSelection().bind(function (sel) {
        return BrTags.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
          return Option.some(Spot.point(sel.finish(), sel.foffset()));
        }, function (brNeighbour) {
          var range = bridge.fromSitus(brNeighbour);
          var analysis = BeforeAfter.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure);
          return BrTags.process(analysis);
        });
      });
    };

    var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
      if (numRetries === 0) return Option.none();
      // Firstly, move the (x, y) and see what element we end up on.
      return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
        var range = bridge.fromSitus(situs);
        // Now, check to see if the element is a new cell.
        var analysis = BeforeAfter.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure);
        return BeforeAfter.cata(analysis, function () {
          return Option.none();
        }, function () {
          // We have a new cell, so we stop looking.
          return Option.some(situs);
        }, function (cell) {
          // We need to look again from the start of our current cell
          return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
        }, function (cell) {
          // We need to look again from the end of our current cell
          return scan(bridge, isRoot, cell, Awareness.getEnd(cell), direction, numRetries - 1);
        });
      });
    };

    var tryCursor = function (bridge, isRoot, element, offset, direction) {
      return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
        // NOTE: As we attempt to take over selection everywhere, we'll probably need to separate these again.
        if (platform.browser.isChrome() || platform.browser.isSafari() || platform.browser.isFirefox()) return direction.otherRetry(bridge, box);
        else if (platform.browser.isIE()) return direction.ieRetry(bridge, box);
        else return Option.none();
      });
    };

    var handle = function (bridge, isRoot, direction) {
      return findSpot(bridge, isRoot, direction).bind(function (spot) {
        // There is a point to start doing box-hitting from
        return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
      });
    };

    return {
      handle: handle
    };
  }
);