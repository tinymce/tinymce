define(
  'ephox.darwin.keyboard.TableKeys',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.darwin.navigation.BrTags',
    'ephox.fred.PlatformDetection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.scullion.ADT'
  ],

  function (Rectangles, BeforeAfter, BrTags, PlatformDetection, Awareness, Option, Spot, Adt) {
    var platform = PlatformDetection.detect();

    var adt = Adt.generate([
      { 'none' : [ 'message'] },
      { 'success': [ ] },
      { 'failedUp': [ 'cell' ] },
      { 'failedDown': [ 'cell' ] }
    ]);

    var findSpot = function (bridge, isRoot, direction) {
      return bridge.getSelection().bind(function (sel) {
        return BrTags.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
          return Option.some(Spot.point(sel.finish(), sel.foffset()));
        }, function (brNeighbour) {
          var range = bridge.fromSitus(brNeighbour);
          var analysis = BeforeAfter.verify(sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure);
          return BrTags.process(analysis);
        });
      });
    };

    var scan = function (bridge, isRoot, element, offset, direction, counter) {
      if (counter === 0) return Option.none();
      // Firstly, move the (x, y) and see what element we end up on.
      return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
        var range = bridge.fromSitus(situs);
        console.log('tried: ', range.start().dom(), range.soffset(), range.finish().dom(), range.foffset());
        // Now, check to see if the element is a new cell.
        var analysis = BeforeAfter.verify(element, offset, range.finish(), range.foffset(), direction.failure);
        return BeforeAfter.cata(analysis, function () {
          console.log('Analysis: none');
          return Option.none();
        }, function () {
          console.log('Analysis: success');
          // We have a new cell, so we stop looking.
          return Option.some(situs);
        }, function (cell) {
          console.log('Analyis: failed up');
          // We need to look again from the start of our current cell
          return scan(bridge, isRoot, cell, 0, direction, counter - 1);
        }, function (cell) {
          console.log('Analysis: failed down');
          // We need to look again from the end of our current cell
          return scan(bridge, isRoot, cell, Awareness.getEnd(cell), direction, counter - 1);
        });
      });
    };

    var tryCursor = function (bridge, isRoot, element, offset, direction) {
      return Rectangles.getBox(bridge, element, offset).bind(function (box) {
        if (platform.browser.isChrome() || platform.browser.isSafari()) return direction.otherRetry(bridge, box);
        else if (platform.browser.isFirefox()) return direction.otherRetry(bridge, box);
        else if (platform.browser.isIE()) return direction.ieRetry(bridge, box);
        else return Option.none();
      });
    };

    var handle = function (bridge, isRoot, direction) {
      return findSpot(bridge, isRoot, direction).bind(function (spot) {
        // There is a point to start doing box-hitting from
        return scan(bridge, isRoot, spot.element(), spot.offset(), direction, 1000).map(bridge.fromSitus);
      });
    };

    return {
      handle: handle
    };
  }
);