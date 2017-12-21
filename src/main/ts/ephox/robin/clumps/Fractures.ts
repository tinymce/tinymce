import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Parent from '../api/general/Parent';
import Breaker from '../parent/Breaker';
import Subset from '../parent/Subset';

// Find the subsection of DIRECT children of parent from [first, last])
var slice = function (universe, parent, first, last) {
  var children = universe.property().children(parent);

  var finder = function (elem) {
    return Arr.findIndex(children, Fun.curry(universe.eq, elem));
  };

  // Default to the start of the common parent.
  var firstIndex = first.bind(finder).getOr(0);
  // Default to the end of the common parent.
  var lastIndex = last.bind(finder).getOr(children.length - 1);
  return firstIndex > -1 && lastIndex > -1 ? Option.some(children.slice(firstIndex, lastIndex + 1)) : Option.none();
};

var breakPath = function (universe, element, common, breaker) {
  var isTop = function (elem) {
    return universe.property().parent(elem).fold(
      Fun.constant(true),
      Fun.curry(universe.eq, common)
    );
  };

  return Parent.breakPath(universe, element, isTop, breaker);
};

var breakLeft = function (universe, element, common) {
  // If we are the top and we are the left, use default value
  if (universe.eq(common, element)) return Option.none();
  else {
    var breakage = breakPath(universe, element, common, Breaker.breakToLeft);
    // Move the first element into the second section of the split because we want to include element in the section.
    if (breakage.splits().length > 0) universe.insert().prepend(breakage.splits()[0].second(), element);
    return Option.some(breakage.second().getOr(element));
  }
};

var breakRight = function (universe, element, common) {
  // If we are the top and we are the right, use default value
  if (universe.eq(common, element)) return Option.none();
  else {
    var breakage = breakPath(universe, element, common, Breaker.breakToRight);
    return Option.some(breakage.first());
  }
};

var same = function (universe, isRoot, element, ceiling) {
  var common = ceiling(element);
  // If there are no important formatting elements above, just return element, otherwise split to important element above.
  return universe.eq(common, element) ? Option.some([ element ]) : breakToCommon(universe, common, element, element);
};

var breakToCommon = function (universe, common, start, finish) {
  // We have the important top-level shared ancestor, we now have to split from the start and finish up
  // to the shared parent. Break from the first node to the common parent AFTER the second break as the first
  // will impact the second (assuming LEFT to RIGHT) and not vice versa.
  var secondBreak = breakRight(universe, finish, common);
  var firstBreak = breakLeft(universe, start, common);
  return slice(universe, common, firstBreak, secondBreak);
};

// Find the shared ancestor that we are going to split up to.
var shared = function (universe, isRoot, start, finish, ceiling) {
  var subset = Subset.ancestors(universe, start, finish, isRoot);
  return subset.shared().orThunk(function () {
    // Default to shared root, if we don't have a shared ancestor.
    return Parent.sharedOne(universe, function (_, elem) {
      return isRoot(elem) ? Option.some(elem) : universe.up().predicate(elem, isRoot);
    }, [ start, finish ]);
  }).map(ceiling);
};

var diff = function (universe, isRoot, start, finish, ceiling) {
  return shared(universe, isRoot, start, finish, ceiling).bind(function (common) {
    return breakToCommon(universe, common, start, finish);
  });
};

var fracture = function (universe, isRoot, start, finish, _ceiling) {
  var ceiling = _ceiling !== undefined ? _ceiling : Fun.identity;
  return universe.eq(start, finish) ? same(universe, isRoot, start, ceiling) : diff(universe, isRoot, start, finish, ceiling);
};

export default <any> {
  fracture: fracture
};