define(
  'ephox.darwin.keyboard.TableKeys',

  [
    'ephox.darwin.keyboard.Carets',
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.keyboard.Retries',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.darwin.navigation.BrTags',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.selection.Awareness'
  ],

  function (Carets, Rectangles, Retries, BeforeAfter, BrTags, Fun, Option, Spot, PlatformDetection, Compare, Awareness) {
    var MAX_RETRIES = 20;

    var platform = PlatformDetection.detect();

    var findSpot = function (bridge, isRoot, direction) {
      return bridge.getSelection().bind(function (sel) {
        return sel.fold(Fun.noop, Fun.noop, function (start, soffset, finish, foffset) {
          return BrTags.tryBr(isRoot, finish, foffset, direction).fold(function () {
            return Option.some(Spot.point(finish, foffset));
          }, function (brNeighbour) {
            var range = bridge.fromSitus(brNeighbour);
            var analysis = BeforeAfter.verify(bridge, finish, foffset, finish, foffset, direction.failure, isRoot);
            return BrTags.process(analysis);
          });
        });
      });
    };

    var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
      if (numRetries === 0) return Option.none();
      // Firstly, move the (x, y) and see what element we end up on.
      return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
        var range = bridge.fromSitus(situs);
        return range.fold(Fun.noop, Fun.noop, function (start, soffset, finish, foffset) {
          // Now, check to see if the element is a new cell.
          var analysis = BeforeAfter.verify(bridge, element, offset, finish, foffset, direction.failure, isRoot);
          return BeforeAfter.cata(analysis, function () {
            return Option.none();
          }, function () {
            // We have a new cell, so we stop looking.
            return Option.some(situs);
          }, function (cell) {
            if (Compare.eq(element, cell) && offset === 0) return tryAgain(bridge, element, offset, Carets.moveUp, direction);
            // We need to look again from the start of our current cell
            else return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
          }, function (cell) {
            // If we were here last time, move and try again.
            if (Compare.eq(element, cell) && offset === Awareness.getEnd(cell)) return tryAgain(bridge, element, offset, Carets.moveDown, direction);
            // We need to look again from the end of our current cell
            else return scan(bridge, isRoot, cell, Awareness.getEnd(cell), direction, numRetries - 1);
          });
        });
      });
    };

    var tryAgain = function (bridge, element, offset, move, direction) {
      return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
        return tryAt(bridge, direction, move(box, Retries.getJumpSize()));
      });
    };

    var tryAt = function (bridge, direction, box) {
      // NOTE: As we attempt to take over selection everywhere, we'll probably need to separate these again.
        if (platform.browser.isChrome() || platform.browser.isSafari() || platform.browser.isFirefox() || platform.browser.isSpartan()) return direction.otherRetry(bridge, box);
        else if (platform.browser.isIE()) return direction.ieRetry(bridge, box);
        else return Option.none();
    };

    var tryCursor = function (bridge, isRoot, element, offset, direction) {
      return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
        return tryAt(bridge, direction, box);
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