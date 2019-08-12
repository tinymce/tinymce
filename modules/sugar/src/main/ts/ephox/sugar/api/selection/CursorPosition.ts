import { Option } from '@ephox/katamari';
import * as PredicateFind from '../search/PredicateFind';
import * as Traverse from '../search/Traverse';
import * as Awareness from './Awareness';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

const first = function (element: Element<DomNode>) {
  return PredicateFind.descendant(element, Awareness.isCursorPosition);
};

const last = function (element: Element<DomNode>) {
  return descendantRtl(element, Awareness.isCursorPosition);
};

// Note, sugar probably needs some RTL traversals.
const descendantRtl: {
  <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>>;
  (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean): Option<Element<DomNode>>;
} = function <T extends DomNode = DomNode>(scope: Element<DomNode>, predicate: (e: Element<DomNode>) => e is Element<T>): Option<Element<T>> {
  const descend = function (element: Element<DomNode>): Option<Element<T>> {
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

    return Option.none<Element<T>>();
  };

  return descend(scope);
};

export {
  first,
  last,
};
