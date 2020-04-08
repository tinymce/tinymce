import { ChildNode, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as PredicateFind from '../search/PredicateFind';
import * as Traverse from '../search/Traverse';
import * as Awareness from './Awareness';

const first = (element: Element<DomNode>) => PredicateFind.descendant(element, Awareness.isCursorPosition);

const last = (element: Element<DomNode>) => descendantRtl(element, Awareness.isCursorPosition);

// Note, sugar probably needs some RTL traversals.
const descendantRtl: {
  <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T & ChildNode>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>>;
} = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode & ChildNode>> => {
  const descend = (element: Element<DomNode>): Option<Element<DomNode & ChildNode>> => {
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

    return Option.none<Element<DomNode & ChildNode>>();
  };

  return descend(scope);
};

export {
  first,
  last
};
