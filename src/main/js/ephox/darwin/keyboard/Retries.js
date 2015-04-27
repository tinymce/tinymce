define(
  'ephox.darwin.keyboard.Retries',

  [
    'ephox.darwin.keyboard.Rectangles',
    'ephox.fussy.api.Point',
    'ephox.perhaps.Option',
    'global!Math'
  ],

  function (Rectangles, Point, Option, Math) {
    var JUMP_SIZE = 5;
    /*
     * This isn't right ... but let's just hook it up first.
     */

    var mogel = function (win, guess, guessBox, caret) {
      // We haven't dropped vertically, so we need to look down and try again. Note, this is not going to
      // work for containers. Yeah, I think this approach is significantly flawed.
      if (guessBox.top <= ((caret.top + caret.bottom) / 2) && guessBox.bottom >= ((caret.top + caret.bottom) / 2)) {
        console.log('try again lower down');
        var newCaret = { left: caret.left, bottom: caret.bottom + JUMP_SIZE };
        return webkitAgain(win, newCaret);
      }

      if (guessBox.top > caret.bottom + JUMP_SIZE) {
        // The returned guessBox based on the guess actually doesn't include the initial caret. So we search again
        // where we adjust the caret so that it is inside the returned guessBox. This means that the offset calculation
        // will be more accurate.
        return Point.find(win, caret.left, guessBox.top + 1).orThunk(function () { return Option.some(guess); });
      } else {
        // We couldn't find any better way to improve our guess.
        return Option.some(guess);
      }
    };

     // In Firefox, it isn't giving you the next element ... it's giving you the current element. So if the box of where it gives you has the same y value
    // minus some error, try again with a bigger jump.
    var firefoxAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + JUMP_SIZE).bind(function (pt) {
        return pt.start().fold(Option.none, function (e, eo) {
          return Rectangles.getBox(win, e, eo).bind(function (box) {
            if (Math.abs(box.top - caret.top) < (2 * JUMP_SIZE)) {
              return firefoxAgain(win, { left: caret.left, bottom: caret.bottom + JUMP_SIZE, top: caret.top + JUMP_SIZE }).orThunk(function () {
                return Option.some(pt);
              });
            }

            return mogel(win, pt, box, caret);
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
            return mogel(win, guess, guessBox, caret);
          });
        }, Option.none);
      });
    };

    var ieAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + 5);
    };


    return {
      webkitAgain: webkitAgain,
      firefoxAgain: firefoxAgain,
      ieAgain: ieAgain
    };
  }
);