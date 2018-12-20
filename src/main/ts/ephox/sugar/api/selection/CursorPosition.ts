import { Option } from '@ephox/katamari';
import * as PredicateFind from '../search/PredicateFind';
import * as Traverse from '../search/Traverse';
import * as Awareness from './Awareness';
import Element from '../node/Element';

const first = function (element: Element) {
  return PredicateFind.descendant(element, Awareness.isCursorPosition);
};

const last = function (element: Element) {
  return descendantRtl(element, Awareness.isCursorPosition);
};

// Note, sugar probably needs some RTL traversals.
const descendantRtl = function (scope: Element, predicate) {
  const descend = function (element): Option<Element> {
    const children = Traverse.children(element);
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (predicate(child)) { return Option.some(child); }
      const res = descend(child);
      if (res.isSome()) { return res; }
    }

    return Option.none<Element>();
  };

  return descend(scope);
};

export {
  first,
  last,
};