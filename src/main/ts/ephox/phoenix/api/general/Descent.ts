import Navigation from '../../wrap/Navigation';

var toLeaf = function (unviverse, element, offset) {
  return Navigation.toLeaf(unviverse, element, offset);
};

var freefallLtr = function (universe, element) {
  return Navigation.freefallLtr(universe, element);
};

var freefallRtl = function (universe, element) {
  return Navigation.freefallRtl(universe, element);
};

export default {
  toLeaf: toLeaf,
  freefallLtr: freefallLtr,
  freefallRtl: freefallRtl
};