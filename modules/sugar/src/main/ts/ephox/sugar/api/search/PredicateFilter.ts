import { Arr } from '@ephox/katamari';

import * as SugarBody from '../node/SugarBody';
import { SugarElement } from '../node/SugarElement';
import * as Traverse from './Traverse';

// maybe TraverseWith, similar to traverse but with a predicate?

const all: {
  <T extends Node = Node>(predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
  (predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
} = (predicate: (e: SugarElement<Node>) => boolean) =>
  descendants(SugarBody.body(), predicate);

const ancestors: {
  <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<T>[];
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean) =>
  Arr.filter(Traverse.parents(scope, isRoot), predicate);

const siblings: {
  <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean) =>
  Arr.filter(Traverse.siblings(scope), predicate);

const children: {
  <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean) =>
  Arr.filter(Traverse.children(scope), predicate);

const descendants: {
  <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean) => {
  let result: SugarElement<Node>[] = [];

  // Recurse.toArray() might help here
  Arr.each(Traverse.children(scope), (x) => {
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
  descendants
};
