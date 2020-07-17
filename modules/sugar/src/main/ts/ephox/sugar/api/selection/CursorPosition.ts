import { Option } from '@ephox/katamari';
import { SugarElement } from '../node/SugarElement';
import * as PredicateFind from '../search/PredicateFind';
import * as Traverse from '../search/Traverse';
import * as Awareness from './Awareness';

const first = (element: SugarElement<Node>) => PredicateFind.descendant(element, Awareness.isCursorPosition);

const last = (element: SugarElement<Node>) => descendantRtl(element, Awareness.isCursorPosition);

// Note, sugar probably needs some RTL traversals.
const descendantRtl: {
  <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): Option<SugarElement<T & ChildNode>>;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): Option<SugarElement<Node & ChildNode>>;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): Option<SugarElement<Node & ChildNode>> => {
  const descend = (element: SugarElement<Node>): Option<SugarElement<Node & ChildNode>> => {
    const children = Traverse.children(element);
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (predicate(child)) {
        return Option.some(child);
      }
      const res = descend(child);
      if (res.isSome()) {
        return res;
      }
    }

    return Option.none<SugarElement<Node & ChildNode>>();
  };

  return descend(scope);
};

export {
  first,
  last
};
