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

    var moveBottomTo = function (caret, bottom) {
      var height = caret.bottom() - caret.top();
      return nu(caret.left(), bottom - height, caret.right(), bottom);
    };

    var translate = function (caret, xDelta, yDelta) {
      return nu(caret.left() + xDelta, caret.top() + yDelta, caret.right() + xDelta, caret.bottom() + yDelta);
    };

    return {
      nu: nu,
      moveUp: moveUp,
      moveDown: moveDown,
      moveBottomTo: moveBottomTo,
      translate: translate
    };
  }
);