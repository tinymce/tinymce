import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var leftRight = Struct.immutable('left', 'right');

var bisect = function (universe, parent, child) {
  var children = universe.property().children(parent);
  var index = Arr.findIndex(children, Fun.curry(universe.eq, child));
  return index.map(function (ind) {
    return {
      before: Fun.constant(children.slice(0, ind)),
      after: Fun.constant(children.slice(ind + 1))
    };
  });
};

/**
 * Clone parent to the RIGHT and move everything after child in the parent element into
 * a clone of the parent (placed after parent).
 */
var breakToRight = function (universe, parent, child) {
  return bisect(universe, parent, child).map(function (parts) {
    var second = universe.create().clone(parent);
    universe.insert().appendAll(second, parts.after());
    universe.insert().after(parent, second);
    return leftRight(parent, second);
  });
};

/**
 * Clone parent to the LEFT and move everything before and including child into
 * the a clone of the parent (placed before parent)
 */
var breakToLeft = function (universe, parent, child) {
  return bisect(universe, parent, child).map(function (parts) {
    var prior = universe.create().clone(parent);
    universe.insert().appendAll(prior, parts.before().concat([ child ]));
    universe.insert().appendAll(parent, parts.after());
    universe.insert().before(parent, prior);
    return leftRight(prior, parent);
  });
};

/*
 * Using the breaker, break from the child up to the top element defined by the predicate.
 * It returns three values:
 *   first: the top level element that completed the break
 *   second: the optional element representing second part of the top-level split if the breaking completed successfully to the top
 *   splits: a list of (Element, Element) pairs that represent the splits that have occurred on the way to the top.
 */
var breakPath = function (universe, item, isTop, breaker) {
  var result = Struct.immutable('first', 'second', 'splits');

  var next = function (child, group, splits) {
    var fallback = result(child, Option.none(), splits);
    // Found the top, so stop.
    if (isTop(child)) return result(child, group, splits);
    else {
      // Split the child at parent, and keep going
      return universe.property().parent(child).bind(function (parent) {
        return breaker(universe, parent, child).map(function (breakage) {
          var extra = [{ first: breakage.left, second: breakage.right }];
          // Our isTop is based on the left-side parent, so keep it regardless of split.
          var nextChild = isTop(parent) ? parent : breakage.left();
          return next(nextChild, Option.some(breakage.right()), splits.concat(extra));
        }).getOr(fallback);
      });
    }
  };

  return next(item, Option.none(), []);
};

export default <any> {
  breakToLeft: breakToLeft,
  breakToRight: breakToRight,
  breakPath: breakPath
};