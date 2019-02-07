import { Arr, Fun, Struct } from '@ephox/katamari';
import { Height, Location, Width } from '@ephox/sugar';

const rowInfo = Struct.immutable('row', 'y');
const colInfo = Struct.immutable('col', 'x');

const rtlEdge = function (cell) {
  const pos = Location.absolute(cell);
  return pos.left() + Width.getOuter(cell);
};

const ltrEdge = function (cell) {
  return Location.absolute(cell).left();
};

const getLeftEdge = function (index, cell) {
  return colInfo(index, ltrEdge(cell));
};

const getRightEdge = function (index, cell) {
  return colInfo(index, rtlEdge(cell));
};

const getTop = function (cell) {
  return Location.absolute(cell).top();
};

const getTopEdge = function (index, cell) {
  return rowInfo(index, getTop(cell));
};

const getBottomEdge = function (index, cell) {
  return rowInfo(index, getTop(cell) + Height.getOuter(cell));
};

const findPositions = function (getInnerEdge, getOuterEdge, array) {
  if (array.length === 0 ) { return []; }
  const lines = Arr.map(array.slice(1), function (cellOption, index) {
    return cellOption.map(function (cell) {
      return getInnerEdge(index, cell);
    });
  });

  const lastLine = array[array.length - 1].map(function (cell) {
    return getOuterEdge(array.length - 1, cell);
  });

  return lines.concat([ lastLine ]);
};

const negate = function (step, _table) {
  return -step;
};

const height = {
  delta: Fun.identity,
  positions: Fun.curry(findPositions, getTopEdge, getBottomEdge),
  edge: getTop
};

const ltr = {
  delta: Fun.identity,
  edge: ltrEdge,
  positions: Fun.curry(findPositions, getLeftEdge, getRightEdge)
};

const rtl = {
  delta: negate,
  edge: rtlEdge,
  positions: Fun.curry(findPositions, getRightEdge, getLeftEdge)
};

export default {
  height,
  rtl,
  ltr
};