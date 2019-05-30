/*
 * The CellLocation ADT is used to represent a cell when navigating. The
 * last type constructor is used because special behaviour may be required
 * when navigating past the last cell (e.g. create a new row).
 */

const folder = function (fold) {
  return {
    fold
  };
};

const none = function (current?) {
  return folder(function (n, f, m, l) {
    return n(current);
  });
};

const first = function (current) {
  return folder(function (n, f, m, l) {
    return f(current);
  });
};

const middle = function (current, target) {
  return folder(function (n, f, m, l) {
    return m(current, target);
  });
};

const last = function (current) {
  return folder(function (n, f, m, l) {
    return l(current);
  });
};

export default {
  none,
  first,
  middle,
  last
};