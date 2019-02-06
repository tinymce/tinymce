/*
 * The CellLocation ADT is used to represent a cell when navigating. The 
 * last type constructor is used because special behaviour may be required
 * when navigating past the last cell (e.g. create a new row).
 */

var folder = function (fold) {
  return {
    fold: fold
  };
};

var none = function (current?) {
  return folder(function (n, f, m, l) {
    return n(current);
  });
};

var first = function (current) {
  return folder(function (n, f, m, l) {
    return f(current);
  });
};

var middle = function (current, target) {
  return folder(function (n, f, m, l) {
    return m(current, target);
  });
};

var last = function (current) {
  return folder(function (n, f, m, l) {
    return l(current);
  });
};

export default {
  none: none,
  first: first,
  middle: middle,
  last: last
};