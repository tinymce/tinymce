import SplitPosition from '../api/data/SplitPosition';

/*
 * Categorise a split of a text node as: none, start, middle, or end
 */
var determine = function (target) {
  return target.before().fold(function () {
    return target.after().fold(function () {
      return SplitPosition.none();
    }, function (a) {
      return SplitPosition.start(a);
    });
  }, function (b) {
    return target.after().fold(function () {
      return SplitPosition.end(b);
    }, function (a) {
      return SplitPosition.middle(b, a);
    });
  });
};

export default {
  determine: determine
};