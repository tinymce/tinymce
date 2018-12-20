import { Fun } from '@ephox/katamari';
import * as Compare from './Compare';
import Element from '../node/Element';
import * as Node from '../node/Node';
import * as PredicateFind from '../search/PredicateFind';
import { document, Window } from '@ephox/dom-globals';

// TEST: Is this just Body.inBody which doesn't need scope ??
const attached = function (element: Element, scope: Element) {
  const doc = scope || Element.fromDom(document.documentElement);
  return PredicateFind.ancestor(element, Fun.curry(Compare.eq, doc)).isSome();
};

// TEST: Is this just Traverse.defaultView ??
const windowOf = function (element: Element): Window {
  const dom = element.dom();
  if (dom === dom.window && element instanceof Window) { return element; }
  return Node.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
};

export {
  attached,
  windowOf,
};