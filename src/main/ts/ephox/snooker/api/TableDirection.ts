import ResizeDirection from './ResizeDirection';



export default function (directionAt) {
  var auto = function (table) {
    return directionAt(table).isRtl() ? ResizeDirection.rtl : ResizeDirection.ltr;
  };

  var delta = function (amount, table) {
    return auto(table).delta(amount, table);
  };

  var positions = function (cols, table) {
    return auto(table).positions(cols);
  };

  var edge = function (cell) {
    return auto(cell).edge(cell);
  };

  return {
    delta: delta,
    edge: edge,
    positions: positions
  };
};