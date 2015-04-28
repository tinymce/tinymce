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
    'ephox.sugar.api.PredicateExists',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Rectangles, Retries, PlatformDetection, SelectionRange, Situ, WindowSelection, Awareness, Fun, Option, DomGather, DomParent, Compare, Node, PredicateExists, SelectorFind, Traverse) {
    var platform = PlatformDetection.detect();

    var handle = function (mover, win, isRoot) {
      return WindowSelection.get(win).bind(function (sel) {
        return hacker(win, mover, isRoot, sel.finish(), sel.foffset(), 1000).map(function (next) {
          return WindowSelection.deriveExact(win, next);
        });
      });
    };

    var isRow = function (elem) {
      return SelectorFind.closest(elem, 'tr');
    };

    var hacker = function (win, mover, isRoot, element, offset, counter) {
      if (counter === 0) return Option.none();
      return mover(win, isRoot, element, offset).bind(function (next) {

        var exact = WindowSelection.deriveExact(win, next);
        console.log('before hackery', next, exact.start().dom(), exact.soffset());
          // Note, this will only work if we are staying in a table.
        return SelectorFind.closest(exact.start(), 'td,th').bind(function (newCell) {
          return SelectorFind.closest(element, 'td,th').bind(function (oldCell) {
            console.log('we have a new cell, oldCell');
            if (! Compare.eq(newCell, oldCell)) {
              return DomParent.sharedOne(isRow, [ newCell, oldCell ]).fold(function () {
                return Option.some(next);
              }, function (sharedRow) {
                console.log('because of this ... ignoring ', newCell.dom());
                return hacker(win, mover, isRoot, oldCell, mover === tryDown ? Awareness.getEnd(oldCell) : 0, counter - 1);
              });
            } else {
              var inNewPosition = PredicateExists.ancestor(element, function (elem) {
                return Compare.eq(elem, exact.start());
              });

              // If we have moved to the containing cell.
              // Note, will have to put (AND LAST POSITION) here, otherwise br tags will be skipped (May have already been done)
              if (inNewPosition && mover === tryDown && exact.soffset() === Awareness.getEnd(exact.start())) {
                return hacker(win, mover, isRoot, exact.start(), exact.soffset(), counter - 1);
              } else if (inNewPosition && mover === tryUp && exact.soffset() === 0) {
                return hacker(win, mover, isRoot, exact.start(), exact.soffset(), counter - 1);
              } else {
                return Option.none();
              }
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
        console.log('candidate for br.down: ', cand.dom());
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
      return candidate.bind(function (cand) {
        console.log('candidate for br.up: ', cand.dom());
        return DomGather.before(cand, isRoot).map(function (next) {
          console.log('br.up.next: ', next.dom());
          return SelectionRange.write(
            Node.name(next) === 'br' ? Situ.on(next, 0) : Situ.after(next),
            Node.name(next) === 'br' ? Situ.on(next, 0) : Situ.after(next)
          );
        });
      });
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