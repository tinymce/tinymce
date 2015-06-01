define(
  'ephox.darwin.keyboard.Retries',

  [
    'ephox.darwin.keyboard.Carets',
    'ephox.darwin.keyboard.Rectangles',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.scullion.ADT',
    'global!Math'
  ],

  function (Carets, Rectangles, Fun, Option, DomGather, Adt, Math) {
    var JUMP_SIZE = 5;
    var NUM_RETRIES = 100;

    var adt = Adt.generate([
      { 'none' : [] },
      { 'retry': [ 'caret' ] },
      { 'adjusted': [ 'caret' ] }
    ]);

    var adjustDown = function (guessBox, original, caret) {
      // We haven't dropped vertically, so we need to look down and try again.
      if (Math.abs(guessBox.bottom() - original.bottom() < 1)) return adt.retry(Carets.moveDown(caret, JUMP_SIZE));
      // The returned guessBox based on the guess actually doesn't include the initial caret. So we search again
      // where we adjust the caret so that it is inside the returned guessBox. This means that the offset calculation
      // will be more accurate.
      else if (guessBox.top() > caret.bottom()) return adt.adjusted(Carets.moveBottomTo(caret, guessBox.top() + 1));
      else return adt.none();
    };

    var adjustUp = function (guessBox, original, caret) {
      // We haven't ascended vertically, so we need to look up and try again.
      if (Math.abs(guessBox.top() - original.top()) < 1) return adt.retry(Carets.moveUp(caret, JUMP_SIZE));
      // The returned guessBox based on the guess actually doesn't include the initial caret. So we search again
      // where we adjust the caret so that it is inside the returned guessBox. This means that the offset calculation
      // will be more accurate.
      else if (guessBox.bottom() < caret.top()) return adt.adjusted(Carets.moveTopTo(caret, guessBox.bottom() - 1));


      else return adt.none();
    };

    var upMovement = {
      point: Carets.getTop,
      adjuster: adjustUp,
      move: Carets.moveUp,
      gather: DomGather.before
    };

    var downMovement = {
      point: Carets.getBottom,
      adjuster: adjustDown,
      move: Carets.moveDown,
      gather: DomGather.after
    };

    var adjustTil = function (bridge, movement, original, caret, numRetries) {
      if (numRetries === 0) return Option.some(caret);
      return bridge.situsFromPoint(caret.left(), movement.point(caret)).bind(function (guess) {
        return guess.start().fold(Option.none, function (element, offset) {
          return Rectangles.getBox(bridge, element, offset).bind(function (guessBox) {
            return movement.adjuster(guessBox, original, caret).fold(Option.none, function (newCaret) {
              return adjustTil(bridge, movement, original, newCaret, numRetries-1);
            }, function (newCaret) {
              return Option.some(newCaret);
            });
          }).orThunk(function () {
            return Option.some(caret);
          });
        }, Option.none);
      });
    };

    var ieTryDown = function (bridge, caret) {
      return bridge.situsFromPoint(caret.left(), caret.bottom() + JUMP_SIZE);
    };

    var ieTryUp = function (bridge, caret) {
      return bridge.situsFromPoint(caret.left(), caret.top() - JUMP_SIZE);
    };

    var checkScroll = function (movement, adjusted, bridge) {
      // I'm not convinced that this is right. Let's re-examine it later.
      if (movement.point(adjusted) > bridge.getInnerHeight()) return Option.some(movement.point(adjusted) - bridge.getInnerHeight());
      else if (movement.point(adjusted) < 0) return Option.some(-movement.point(adjusted));
      else return Option.none();
    };

    var retry = function (movement, bridge, caret) {
      var moved = movement.move(caret, JUMP_SIZE);
      var adjusted = adjustTil(bridge, movement, caret, moved, NUM_RETRIES).getOr(moved);
      return checkScroll(movement, adjusted, bridge).fold(function () {
        return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted));
      }, function (delta) {
        bridge.scrollBy(0, delta);
        return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted) - delta);
      });
    };

    return {
      tryUp: Fun.curry(retry, upMovement),
      tryDown: Fun.curry(retry, downMovement),
      ieTryUp: ieTryUp,
      ieTryDown: ieTryDown
    };
  }
);