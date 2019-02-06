import ResizeDirection from './ResizeDirection';

export default function (directionAt) {
  const auto = function (table) {
    return directionAt(table).isRtl() ? ResizeDirection.rtl : ResizeDirection.ltr;
  };

  const delta = function (amount, table) {
    return auto(table).delta(amount, table);
  };

  const positions = function (cols, table) {
    return auto(table).positions(cols);
  };

  const edge = function (cell) {
    return auto(cell).edge(cell);
  };

  return {
    delta,
    edge,
    positions
  };
}