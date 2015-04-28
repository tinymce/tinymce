define(
  'ephox.darwin.keyboard.Caret',

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

    // if (guessBox.top > caret.bottom + JUMP_SIZE) {
    // return null;


    return {
      nu: nu,
      moveUp: moveUp,
      moveDown: moveDown
    };
  }
);