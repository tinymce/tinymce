import { Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Node, PlatformDetection } from '@ephox/sand';
import Element from '../node/Element';
import * as Selectors from '../search/Selectors';

const eq = function (e1: Element<unknown>, e2: Element<unknown>) {
  return e1.dom() === e2.dom();
};

const isEqualNode = function (e1: Element<DomNode>, e2: Element<DomNode>) {
  return e1.dom().isEqualNode(e2.dom());
};

const member = function (element: Element, elements: Element[]) {
  return Arr.exists(elements, Fun.curry(eq, element));
};

// DOM contains() method returns true if e1===e2, we define our contains() to return false (a node does not contain itself).
const regularContains = function (e1: Element<DomNode>, e2: Element<DomNode>) {
  const d1 = e1.dom();
  const d2 = e2.dom();
  return d1 === d2 ? false : d1.contains(d2);
};

const ieContains = function (e1: Element<DomNode>, e2: Element<DomNode>) {
  // IE only implements the contains() method for Element nodes.
  // It fails for Text nodes, so implement it using compareDocumentPosition()
  // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
  // Note that compareDocumentPosition returns CONTAINED_BY if 'e2 *is_contained_by* e1':
  // Also, compareDocumentPosition defines a node containing itself as false.
  return Node.documentPositionContainedBy(e1.dom(), e2.dom());
};

const browser = PlatformDetection.detect().browser;

// Returns: true if node e1 contains e2, otherwise false.
// (returns false if e1===e2: A node does not contain itself).
const contains = browser.isIE() ? ieContains : regularContains;

const is = Selectors.is;

export {
  eq, isEqualNode, member, contains,
  // Only used by DomUniverse. Remove (or should Selectors.is move here?)
  is
};
