define(
  'ephox.darwin.keyboard.Retries',

  [
    'ephox.darwin.keyboard.Carets',
    'ephox.darwin.keyboard.Rectangles',
    'ephox.fussy.api.Point',
    'ephox.perhaps.Option',
    'ephox.scullion.ADT',
    'global!Math'
  ],

  function (Carets, Rectangles, Point, Option, Adt, Math) {
    var JUMP_SIZE = 5;
    /*
     * This isn't right ... but let's just hook it up first.
     */

    var adt = Adt.generate([
      { 'none' : [] },
      { 'retry': [ 'caret' ] },
      { 'adjusted': [ 'caret' ] }
    ]);

    var adjustCaret = function (guessBox, original, caret) {
      // We haven't dropped vertically, so we need to look down and try again.
      if (guessBox.bottom === original.bottom()) return adt.retry(Carets.moveDown(caret));
      // The returned guessBox based on the guess actually doesn't include the initial caret. So we search again
      // where we adjust the caret so that it is inside the returned guessBox. This means that the offset calculation
      // will be more accurate.
      else if (guessBox.top > caret.bottom()) return adt.adjusted(Carets.moveBottomTo(caret, guessBox.top + 1));
      else return adt.none();
    };

    var mogel = function (win, guessBox, caret) {

      if (guessBox.bottom === caret.bottom) return webkitAgain(win, { left: caret.left, bottom: caret.bottom + JUMP_SIZE });
      else if (guessBox.top > caret.bottom) return Point.find(win, caret.left, guessBox.top + 1);
      // We couldn't find any better way to improve our guess.
      else return Option.none();
    };

    var sameBottom = function (guessBox, caret) {
      return guessBox.bottom === caret.bottom;
    };

    var adjustTil = function (win, original, caret) {
      return Point.find(win, caret.left(), caret.bottom()).bind(function (guess) {
        return guess.start().fold(Option.none, function (element, offset) {
          return Rectangles.getBox(win, element, offset).bind(function (guessBox) {
            return adjustCaret(guessBox, original, caret).fold(Option.none, function (newCaret) {
              console.log('Retrying', newCaret.bottom());
              return adjustTil(win, original, newCaret);
            }, function (newCaret) {
              console.log('Adjusted to: ', newCaret.bottom(), ' because of ', element.dom());
              return Option.some(newCaret);
            });
          });
        }, Option.none);
      });
    };

    // var firefox = [ ]

     // In Firefox, it isn't giving you the next element ... it's giving you the current element. So if the box of where it gives you has the same y value
    // minus some error, try again with a bigger jump.
    var firefoxAgain = function (win, caret, _adjustedCaret) {
      var adjustedCaret = _adjustedCaret !== undefined ? _adjustedCaret : caret;
      return Point.find(win, adjustedCaret.left, adjustedCaret.bottom + JUMP_SIZE).bind(function (guess) {
        return guess.start().fold(Option.none, function (e, eo) {
          console.log('e: ', e.dom());
          return Rectangles.getBox(win, e, eo).bind(function (guessBox) {
            if (sameBottom(guessBox, caret)) return firefoxAgain(win, caret, { left: adjustedCaret.left, bottom: adjustedCaret.bottom + JUMP_SIZE, top: adjustedCaret.top + JUMP_SIZE });
            return mogel(win, guessBox, caret);
          }).orThunk(function () {
            return Option.some(guess);
          });
        }, Option.none);
      });
    };

    // The process is that you incrementally go down ... if you find the next element, but your top is not at that element's bounding rect.
    // then try again with the same x but the box's y
    var webkitAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + JUMP_SIZE).bind(function (guess) {
        return guess.start().fold(Option.none, function (e, eo) {
          return Rectangles.getBox(win, e, eo).bind(function (guessBox) {
            return mogel(win, guessBox, caret).orThunk(function () {
              return Option.some(guess);
            });
          });
        }, Option.none);
      });
    };

    var ieAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + 5);
    };

    var all = function (win, caret) {
      console.log('-----------------------------------------------');
      console.log('-----------------------------------------------');
      var c = Carets.nu(caret.left, caret.top, caret.right, caret.bottom);
      var moved = Carets.moveDown(c);
      var adjusted = adjustTil(win, c, moved).getOr(moved);
      console.log('initial caret', caret.left, caret.top, caret.right, caret.bottom);
      console.log('post caret', adjusted.left(), adjusted.top(), adjusted.right(), adjusted.bottom());
      return Point.find(win, adjusted.left(), adjusted.bottom());
    };

    return {
      webkitAgain: all,
      firefoxAgain: all,
      ieAgain: ieAgain
    };
  }
);