import { Struct } from '@ephox/katamari';

export interface Carets {
  left: () => number;
  top: () => number;
  right: () => number;
  bottom: () => number;
}

interface CaretsIn {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const nu: (data: CaretsIn) => Carets = Struct.immutableBag(['left', 'top', 'right', 'bottom'], []);

const moveDown = function (caret: Carets, amount: number) {
  return nu({
    left: caret.left(),
    top: caret.top() + amount,
    right: caret.right(),
    bottom: caret.bottom() + amount
  });
};

const moveUp = function (caret: Carets, amount: number) {
  return nu({
    left: caret.left(),
    top: caret.top() - amount,
    right: caret.right(),
    bottom: caret.bottom() - amount
  });
};

const moveBottomTo = function (caret: Carets, bottom: number) {
  const height = caret.bottom() - caret.top();
  return nu({
    left: caret.left(),
    top: bottom - height,
    right: caret.right(),
    bottom
  });
};

const moveTopTo = function (caret: Carets, top: number) {
  const height = caret.bottom() - caret.top();
  return nu({
    left: caret.left(),
    top,
    right: caret.right(),
    bottom: top + height
  });
};

const translate = function (caret: Carets, xDelta: number, yDelta: number) {
  return nu({
    left: caret.left() + xDelta,
    top: caret.top() + yDelta,
    right: caret.right() + xDelta,
    bottom: caret.bottom() + yDelta
  });
};

const getTop = function (caret: Carets) {
  return caret.top();
};

const getBottom = function (caret: Carets) {
  return caret.bottom();
};

const toString = function (caret: Carets) {
  return '(' + caret.left() + ', ' + caret.top() + ') -> (' + caret.right() + ', ' + caret.bottom() + ')';
};

export const Carets = {
  nu,
  moveUp,
  moveDown,
  moveBottomTo,
  moveTopTo,
  getTop,
  getBottom,
  translate,
  toString
};