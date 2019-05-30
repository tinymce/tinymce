import Global from '../util/Global';
import { Node } from '@ephox/dom-globals';

/*
 * MDN says (yes) for IE, but it's undefined on IE8
 */
const node = function () {
  const f: typeof Node = Global.getOrDie('Node');
  return f;
};

/*
 * Most of sand doesn't alter the methods on the object.
 * We're making an exception for Node, because bitwise and is so easy to get wrong.
 *
 * Might be nice to ADT this at some point instead of having individual methods.
 */

const compareDocumentPosition = function (a: Node, b: Node, match: number) {
  // Returns: 0 if e1 and e2 are the same node, or a bitmask comparing the positions
  // of nodes e1 and e2 in their documents. See the URL below for bitmask interpretation
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
  return (a.compareDocumentPosition(b) & match) !== 0;
};

const documentPositionPreceding = function (a: Node, b: Node) {
  return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
};

const documentPositionContainedBy = function (a: Node, b: Node) {
  return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
};

export default {
  documentPositionPreceding,
  documentPositionContainedBy
};