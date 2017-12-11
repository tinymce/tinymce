import { Arr } from '@ephox/katamari';
import Body from '../node/Body';
import Traverse from './Traverse';

// maybe TraverseWith, similar to traverse but with a predicate?

var all = function (predicate) {
  return descendants(Body.body(), predicate);
};

var ancestors = function (scope, predicate, isRoot) {
  return Arr.filter(Traverse.parents(scope, isRoot), predicate);
};

var siblings = function (scope, predicate) {
  return Arr.filter(Traverse.siblings(scope), predicate);
};

var children = function (scope, predicate) {
  return Arr.filter(Traverse.children(scope), predicate);
};

var descendants = function (scope, predicate) {
  var result = [];

  // Recurse.toArray() might help here
  Arr.each(Traverse.children(scope), function (x) {
    if (predicate(x)) {
      result = result.concat([ x ]);
    }
    result = result.concat(descendants(x, predicate));
  });
  return result;
};

export default <any> {
  all: all,
  ancestors: ancestors,
  siblings: siblings,
  children: children,
  descendants: descendants
};