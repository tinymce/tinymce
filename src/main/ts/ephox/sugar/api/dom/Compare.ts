import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Node } from '@ephox/sand';
import { PlatformDetection } from '@ephox/sand';
import Selectors from '../search/Selectors';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

var eq = function (e1: Element, e2: Element) {
  return e1.dom() === e2.dom();
};

var isEqualNode = function (e1: Element, e2: Element) {
  return (e1.dom() as DomNode).isEqualNode(e2.dom() as DomNode);
};

var member = function (element: Element, elements: Element[]) {
  return Arr.exists(elements, Fun.curry(eq, element));
};

// DOM contains() method returns true if e1===e2, we define our contains() to return false (a node does not contain itself).
var regularContains = function (e1: Element, e2: Element) {
  var d1: DomNode = e1.dom(), d2: DomNode = e2.dom();
  return d1 === d2 ? false : d1.contains(d2);
};

var ieContains = function (e1: Element, e2: Element) {
  // IE only implements the contains() method for Element nodes.
  // It fails for Text nodes, so implement it using compareDocumentPosition()
  // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
  // Note that compareDocumentPosition returns CONTAINED_BY if 'e2 *is_contained_by* e1':
  // Also, compareDocumentPosition defines a node containing itself as false.
  return Node.documentPositionContainedBy(e1.dom(), e2.dom()) as boolean;
};

var browser = PlatformDetection.detect().browser;

// Returns: true if node e1 contains e2, otherwise false.
// (returns false if e1===e2: A node does not contain itself).
var contains = browser.isIE() ? ieContains : regularContains;

export default {
  eq,
  isEqualNode,
  member,
  contains,

  // Only used by DomUniverse. Remove (or should Selectors.is move here?)
  is: Selectors.is
};