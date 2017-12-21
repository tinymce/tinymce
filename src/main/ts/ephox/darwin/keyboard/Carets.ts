import { Struct } from '@ephox/katamari';

var nu = Struct.immutableBag([ 'left', 'top', 'right', 'bottom' ], []);

var moveDown = function (caret, amount) {
  return nu({
    left: caret.left(),
    top: caret.top() + amount,
    right: caret.right(),
    bottom: caret.bottom() + amount
  });
};

var moveUp = function (caret, amount) {
  return nu({
    left: caret.left(),
    top: caret.top() - amount,
    right: caret.right(),
    bottom: caret.bottom() - amount
  });
};

var moveBottomTo = function (caret, bottom) {
  var height = caret.bottom() - caret.top();
  return nu({
    left: caret.left(),
    top: bottom - height,
    right: caret.right(),
    bottom: bottom
  });
};

var moveTopTo = function (caret, top) {
  var height = caret.bottom() - caret.top();
  return nu({
    left: caret.left(),
    top: top,
    right: caret.right(),
    bottom: top + height
  });
};

var translate = function (caret, xDelta, yDelta) {
  return nu({
    left: caret.left() + xDelta,
    top: caret.top() + yDelta,
    right: caret.right() + xDelta,
    bottom: caret.bottom() + yDelta
  });
};

var getTop = function (caret) {
  return caret.top();
};

var getBottom = function (caret) {
  return caret.bottom();
};

var toString = function (caret) {
  return '(' + caret.left() + ', ' + caret.top() + ') -> (' + caret.right() + ', ' + caret.bottom() + ')';
};

export default <any> {
  nu: nu,
  moveUp: moveUp,
  moveDown: moveDown,
  moveBottomTo: moveBottomTo,
  moveTopTo: moveTopTo,
  getTop: getTop,
  getBottom: getBottom,
  translate: translate,
  toString: toString
};