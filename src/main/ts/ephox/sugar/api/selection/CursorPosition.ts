import { Option } from '@ephox/katamari';
import * as PredicateFind from '../search/PredicateFind';
import * as Traverse from '../search/Traverse';
import * as Awareness from './Awareness';
import Element from '../node/Element';

var first = function (element: Element) {
  return PredicateFind.descendant(element, Awareness.isCursorPosition);
};

var last = function (element: Element) {
  return descendantRtl(element, Awareness.isCursorPosition);
};

// Note, sugar probably needs some RTL traversals.
var descendantRtl = function (scope: Element, predicate) {
  var descend = function (element): Option<Element> {
    var children = Traverse.children(element);
    for (var i = children.length - 1; i >= 0; i--) {
      var child = children[i];
      if (predicate(child)) return Option.some(child);
      var res = descend(child);
      if (res.isSome()) return res;
    }

    return Option.none<Element>();
  };

  return descend(scope);
};

export {
  first,
  last,
};