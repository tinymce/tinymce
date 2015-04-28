define(
  'ephox.darwin.keyboard.Carets',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var JUMP_SIZE = 5;

    var nu = Struct.immutable('left', 'top', 'right', 'bottom');

    var moveDown = function (caret) {
      return nu(caret.left(), caret.top() + JUMP_SIZE, caret.right(), caret.bottom() + JUMP_SIZE);
    };

    var moveUp = function (caret) {
      return nu(caret.left(), caret.top() - JUMP_SIZE, caret.right(), caret.bottom() - JUMP_SIZE);
    };

    var moveTopTo = function (caret, top) {
      var height = caret.bottom() - caret.top();
      return nu(caret.left(), top, caret.right(), top + height);
    };

    var translate = function (caret, xDelta, yDelta) {
      return nu(caret.left() + xDelta, caret.top() + yDelta, caret.right() + xDelta, caret.bottom() + yDelta);
    };

    // if (guessBox.top > caret.bottom + JUMP_SIZE) {
    // return null;


    return {
      nu: nu,
      moveUp: moveUp,
      moveDown: moveDown,
      moveTopTo: moveTopTo,
      translate: translate
    };
  }
);