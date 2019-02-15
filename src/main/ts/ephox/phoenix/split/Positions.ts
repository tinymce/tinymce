import { SplitPosition } from '../api/data/SplitPosition';
import { TextSplit } from '../api/data/TextSplit';

/*
 * Categorise a split of a text node as: none, start, middle, or end
 */
var determine = function <E>(target: TextSplit<E>) {
  return target.before().fold(function () {
    return target.after().fold(function () {
      return SplitPosition.none<E>();
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

export {
  determine
};