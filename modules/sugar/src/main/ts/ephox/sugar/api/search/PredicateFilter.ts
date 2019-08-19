import { Arr } from '@ephox/katamari';
import * as Body from '../node/Body';
import * as Traverse from './Traverse';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

// maybe TraverseWith, similar to traverse but with a predicate?

const all: {
  <T extends DomNode = DomNode>(predicate: (e: Element<DomNode>) => e is Element<T>): Element<T>[];
  (predicate: (e: Element<DomNode>) => boolean): Element<DomNode>[];
} = function <T extends DomNode = DomNode>(predicate: (e: Element<DomNode>) => e is Element<T>) {
  return descendants(Body.body(), predicate);
};

const ancestors: {
  <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean): Element<T>[];
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean): Element<DomNode>[];
} = function <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>, isRoot?: (e: Element<DomNode>) => boolean) {
  return Arr.filter(Traverse.parents(scope, isRoot), predicate);
};

const siblings: {
  <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Element<T>[];
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Element<DomNode>[];
} = function <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>) {
  return Arr.filter(Traverse.siblings(scope), predicate);
};

const children: {
  <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Element<T>[];
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Element<DomNode>[];
} = function <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>) {
  return Arr.filter(Traverse.children(scope), predicate);
};

const descendants: {
  <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Element<T>[];
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Element<DomNode>[];
} = function <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>) {
  let result: Element<T>[] = [];

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