import { Fun } from '@ephox/katamari';
import Compare from './Compare';
import Element from '../node/Element';
import Node from '../node/Node';
import PredicateFind from '../search/PredicateFind';
import { document, Window } from '@ephox/dom-globals';
import { HTMLElement } from '@ephox/dom-globals';

// TEST: Is this just Body.inBody which doesn't need scope ??
var attached = function (element: Element, scope: Element) {
  var doc = scope || Element.fromDom(document.documentElement);
  return PredicateFind.ancestor(element, Fun.curry(Compare.eq, doc)).isSome();
};

// TEST: Is this just Traverse.defaultView ??
var windowOf = function (element: Element): Window {
  var dom = element.dom();
  if (dom === dom.window && element instanceof Window) return element;
  return Node.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
};

export default {
  attached,
  windowOf,
};