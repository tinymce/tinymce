import { Arr } from '@ephox/katamari';
import * as Body from '../node/Body';
import * as Traverse from './Traverse';
import Element from '../node/Element';

// maybe TraverseWith, similar to traverse but with a predicate?

const all = function (predicate: (e: Element) => boolean) {
  return descendants(Body.body(), predicate);
};

const ancestors = function (scope: Element, predicate: (e: Element) => boolean, isRoot?: (e: Element) => boolean) {
  return Arr.filter(Traverse.parents(scope, isRoot), predicate);
};

const siblings = function (scope: Element, predicate: (e: Element) => boolean) {
  return Arr.filter(Traverse.siblings(scope), predicate);
};

const children = function (scope: Element, predicate: (e: Element) => boolean) {
  return Arr.filter(Traverse.children(scope), predicate);
};

const descendants = function (scope: Element, predicate: (e: Element) => boolean) {
  let result: Element[] = [];

  // Recurse.toArray() might help here
  Arr.each(Traverse.children(scope), function (x) {
    if (predicate(x)) {
      result = result.concat([ x ]);
    }
    result = result.concat(descendants(x, predicate));
  });
  return result;
};

export {
  all,
  ancestors,
  siblings,
  children,
  descendants,
};