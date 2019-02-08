import Boundaries from '../array/Boundaries';
import Slice from '../array/Slice';
import Split from '../array/Split';

const boundAt = function (xs, left, right, comparator) {
  return Boundaries.boundAt(xs, left, right, comparator);
};

const splitby = function (array, predicate) {
  return Split.splitby(array, predicate);
};

const splitbyAdv = function (array, predicate) {
  return Split.splitbyAdv(array, predicate);
};

const sliceby = function (array, predicate) {
  return Slice.sliceby(array, predicate);
};

export default {
  splitby,
  splitbyAdv,
  sliceby,
  boundAt
};