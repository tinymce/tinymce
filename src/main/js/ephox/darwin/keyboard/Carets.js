define(
  'ephox.darwin.keyboard.Carets',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var nu = Struct.immutable('left', 'top', 'right', 'bottom');

    var moveDown = function (caret, amount) {
      return nu(caret.left(), caret.top() + amount, caret.right(), caret.bottom() + amount);
    };

    var moveUp = function (caret, amount) {
      return nu(caret.left(), caret.top() - amount, caret.right(), caret.bottom() - amount);
    };

    var moveBottomTo = function (caret, bottom) {
      var height = caret.bottom() - caret.top();
      return nu(caret.left(), bottom - height, caret.right(), bottom);
    };

    var moveTopTo = function (caret, top) {
      var height = caret.bottom() - caret.top();
      return nu(caret.left(), top, caret.right(), top + height);
    };

    var translate = function (caret, xDelta, yDelta) {
      return nu(caret.left() + xDelta, caret.top() + yDelta, caret.right() + xDelta, caret.bottom() + yDelta);
    };

    var getTop = function (caret) {
      return caret.top();
    };

    var getBottom = function (caret) {
      return caret.bottom();
    };

    return {
      nu: nu,
      moveUp: moveUp,
      moveDown: moveDown,
      moveBottomTo: moveBottomTo,
      moveTopTo: moveTopTo,
      getTop: getTop,
      getBottom: getBottom,
      translate: translate
    };
  }
);