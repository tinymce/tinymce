import { Arr } from '@ephox/katamari';
import Body from '../node/Body';
import Traverse from './Traverse';
import Element from '../node/Element';

// maybe TraverseWith, similar to traverse but with a predicate?

var all = function (predicate: (e: Element) => boolean) {
  return descendants(Body.body(), predicate);
};

var ancestors = function (scope: Element, predicate: (e: Element) => boolean, isRoot?: (e: Element) => boolean) {
  return Arr.filter(Traverse.parents(scope, isRoot), predicate);
};

var siblings = function (scope: Element, predicate: (e: Element) => boolean) {
  return Arr.filter(Traverse.siblings(scope), predicate);
};

var children = function (scope: Element, predicate: (e: Element) => boolean) {
  return Arr.filter(Traverse.children(scope), predicate);
};

var descendants = function (scope: Element, predicate: (e: Element) => boolean) {
  var result: Element[] = [];

  // Recurse.toArray() might help here
  Arr.each(Traverse.children(scope), function (x) {
    if (predicate(x)) {
      result = result.concat([ x ]);
    }
    result = result.concat(descendants(x, predicate));
  });
  return result;
};

export default {
  all,
  ancestors,
  siblings,
  children,
  descendants,
};