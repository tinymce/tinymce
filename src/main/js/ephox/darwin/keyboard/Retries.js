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

    var adjustTil = function (win, original, caret) {
      return Point.find(win, caret.left(), caret.bottom()).bind(function (guess) {
        return guess.start().fold(Option.none, function (element, offset) {
          return Rectangles.getBox(win, element, offset).bind(function (guessBox) {
            return adjustCaret(guessBox, original, caret).fold(Option.none, function (newCaret) {
              return adjustTil(win, original, newCaret);
            }, function (newCaret) {
              return Option.some(newCaret);
            });
          });
        }, Option.none);
      });
    };

    var ieAgain = function (win, caret) {
      return Point.find(win, caret.left, caret.bottom + 5);
    };

    var retry = function (win, caret) {
      var c = Carets.nu(caret.left, caret.top, caret.right, caret.bottom);
      var moved = Carets.moveDown(c);
      var adjusted = adjustTil(win, c, moved).getOr(moved);
      return Point.find(win, adjusted.left(), adjusted.bottom());
    };

    return {
      webkitAgain: retry,
      firefoxAgain: retry,
      ieAgain: ieAgain
    };
  }
);