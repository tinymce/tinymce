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
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Rectangles, Retries, PlatformDetection, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, DomGather, DomParent, Compare, Node, SelectorFind, Traverse) {
    var platform = PlatformDetection.detect();

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
                return hacker(win, mover, isRoot, oldCell, mover === tryDown ? Awareness.getEnd(oldCell) : 0);
              });
            } else {
              return Option.none();
            }
          });
        });
      });
    };


    var tryCursorDown = function (win, isRoot, element, offset) {
      console.log('element', element.dom());
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

    var tryBrDown = function (win, isRoot, element, offset) {
      console.log('br.down', element.dom(), offset);
      var candidate = isBr(element) ? Option.some(element) : Traverse.child(element, offset).filter(isBr);

      return candidate.bind(function (cand) {
        console.log('candidate for br: ', cand.dom());
        return DomGather.after(cand, isRoot).map(function (next) {
          return SelectionRange.write(
            Situ.before(next),
            Situ.before(next)
          );
        });
      });
    };

    var tryBrUp = function (win, isRoot, element, offset) {
       var candidate = isBr(element) ? Option.some(element) : Traverse.child(element, offset).filter(isBr);
       return Option.none();
    };

    var tryDown = function (win, isRoot, element, offset) {
      return tryBrDown(win, isRoot, element, offset).orThunk(function () {
        return tryCursorDown(win, isRoot, element, offset);
      });
    };

    var tryUp = function (win, isRoot, element, offset) {
      return tryBrUp(win, isRoot, element, offset).orThunk(function () {
        return tryCursorUp(win, isRoot, element, offset);
      });
    };


    return {
      handleUp: Fun.curry(handle, tryUp),
      handleDown: Fun.curry(handle, tryDown)
    };
  }
);