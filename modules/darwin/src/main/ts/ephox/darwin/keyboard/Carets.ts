export interface Carets {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const moveDown = (caret: Carets, amount: number): Carets => {
  return {
    left: caret.left,
    top: caret.top + amount,
    right: caret.right,
    bottom: caret.bottom + amount
  };
};

const moveUp = (caret: Carets, amount: number): Carets => {
  return {
    left: caret.left,
    top: caret.top - amount,
    right: caret.right,
    bottom: caret.bottom - amount
  };
};

const moveBottomTo = (caret: Carets, bottom: number): Carets => {
  const height = caret.bottom - caret.top;
  return {
    left: caret.left,
    top: bottom - height,
    right: caret.right,
    bottom
  };
};

const moveTopTo = (caret: Carets, top: number): Carets => {
  const height = caret.bottom - caret.top;
  return ({
    left: caret.left,
    top,
    right: caret.right,
    bottom: top + height
  });
};

const translate = (caret: Carets, xDelta: number, yDelta: number): Carets => {
  return {
    left: caret.left + xDelta,
    top: caret.top + yDelta,
    right: caret.right + xDelta,
    bottom: caret.bottom + yDelta
  };
};

const getTop = (caret: Carets): number => {
  return caret.top;
};

const getBottom = (caret: Carets): number => {
  return caret.bottom;
};

const toString = (caret: Carets): string => {
  return '(' + caret.left + ', ' + caret.top + ') -> (' + caret.right + ', ' + caret.bottom + ')';
};

export {
  moveUp,
  moveDown,
  moveBottomTo,
  moveTopTo,
  getTop,
  getBottom,
  translate,
  toString
};
