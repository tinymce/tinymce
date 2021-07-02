import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection, SandNode } from '@ephox/sand';

import { SugarElement } from '../node/SugarElement';
import * as Selectors from '../search/Selectors';

const eq = (e1: SugarElement<unknown>, e2: SugarElement<unknown>): boolean =>
  e1.dom === e2.dom;

const isEqualNode = (e1: SugarElement<Node>, e2: SugarElement<Node>): boolean =>
  e1.dom.isEqualNode(e2.dom);

const member = (element: SugarElement, elements: SugarElement[]): boolean =>
  Arr.exists(elements, Fun.curry(eq, element));

// DOM contains() method returns true if e1===e2, we define our contains() to return false (a node does not contain itself).
const regularContains = (e1: SugarElement<Node>, e2: SugarElement<Node>): boolean => {
  const d1 = e1.dom;
  const d2 = e2.dom;
  return d1 === d2 ? false : d1.contains(d2);
};

// IE only implements the contains() method for Element nodes.
// It fails for Text nodes, so implement it using compareDocumentPosition()
// https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
// Note that compareDocumentPosition returns CONTAINED_BY if 'e2 *is_contained_by* e1':
// Also, compareDocumentPosition defines a node containing itself as false.
const ieContains = (e1: SugarElement<Node>, e2: SugarElement<Node>): boolean =>
  SandNode.documentPositionContainedBy(e1.dom, e2.dom);

// Returns: true if node e1 contains e2, otherwise false.
// (returns false if e1===e2: A node does not contain itself).
const contains = (e1: SugarElement<Node>, e2: SugarElement<Node>): boolean =>
  PlatformDetection.detect().browser.isIE() ? ieContains(e1, e2) : regularContains(e1, e2);

const is = Selectors.is;

export {
  eq,
  isEqualNode,
  member,
  contains,
  // Only used by DomUniverse. Remove (or should Selectors.is move here?)
  is
};
