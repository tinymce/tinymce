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
    'ephox.scullion.ADT'
  ],

  function (Rectangles, Retries, BeforeAfter, BrTags, PlatformDetection, WindowSelection, Awareness, Fun, Option, Spot, Adt) {
    var platform = PlatformDetection.detect();

    var adt = Adt.generate([
      { 'none' : [ 'message'] },
      { 'success': [ ] },
      { 'failedUp': [ 'cell' ] },
      { 'failedDown': [ 'cell' ] }
    ]);

    var findSpot = function (brPreview, cursorPreview, win, isRoot) {
      console.log('finding spot');
      return WindowSelection.get(win).bind(function (sel) {
        return brPreview(win, isRoot, sel.finish(), sel.foffset()).fold(function () {
          console.log('>> Could not find an anchor for an initial br (or an initial br). Using box-hitting.');
          return Option.some(Spot.point(sel.finish(), sel.foffset()));
        }, function (brNeighbour) {
          var range = WindowSelection.deriveExact(win, brNeighbour);
          console.log('<< Found an anchor point for an initial br', range.finish().dom(), range.foffset());
          var failure = cursorPreview === tryCursorDown ? BeforeAfter.adt.failedDown : BeforeAfter.adt.failedUp;
          var analysis = BeforeAfter.verify(sel.finish(), range.finish(), failure);
          return BrTags.process(analysis);
        });
      });
    };

    var handle = function (brPreview, cursorPreview, win, isRoot) {
      return findSpot(brPreview, cursorPreview, win, isRoot).bind(function (spot) {
        // There is a point to start doing box-hitting from
        return scan(win, cursorPreview, isRoot, spot.element(), spot.offset(), 1000).map(function (tgt) {
          return WindowSelection.deriveExact(win, tgt);
        });
      });
    };

    var scan = function (win, cursorPreview, isRoot, element, offset, counter) {
      if (counter === 0) return Option.none();
      return cursorPreview(win, isRoot, element, offset).bind(function (next) {
        var range = WindowSelection.deriveExact(win, next);
        var failure = cursorPreview === tryCursorDown ? BeforeAfter.adt.failedDown : BeforeAfter.adt.failedUp;
        var analysis = BeforeAfter.verify(element, range.finish(), failure);
        return BeforeAfter.cata(analysis, function () {
          return Option.none('ADT: none');
        }, function () {
          return Option.some(next);
        }, function (cell) {
          return scan(win, cursorPreview, isRoot, cell, 0, counter - 1);
        }, function (cell) {
          return scan(win, cursorPreview, isRoot, cell, Awareness.getEnd(cell), counter - 1);
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