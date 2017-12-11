import Boundaries from '../array/Boundaries';
import Slice from '../array/Slice';
import Split from '../array/Split';

var boundAt = function (xs, left, right, comparator) {
  return Boundaries.boundAt(xs, left, right, comparator);
};

var splitby = function (array, predicate) {
  return Split.splitby(array, predicate);
};

var splitbyAdv = function (array, predicate) {
  return Split.splitbyAdv(array, predicate);
};

var sliceby = function (array, predicate) {
  return Slice.sliceby(array, predicate);
};

export default <any> {
  splitby: splitby,
  splitbyAdv: splitbyAdv,
  sliceby: sliceby,
  boundAt: boundAt
};