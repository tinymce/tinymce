import * as Compare from './Compare';
import Element from '../node/Element';
import * as Traverse from '../search/Traverse';
import { Document } from '@ephox/dom-globals';

const makeRange = function (start: Element, soffset: number, finish: Element, foffset: number) {
  const doc = Traverse.owner(start);

  // TODO: We need to think about a better place to put native range creation code. Does it even belong in sugar?
  // Could the `Compare` checks (node.compareDocumentPosition) handle these situations better?
  const rng = (doc.dom() as Document).createRange();
  rng.setStart(start.dom(), soffset);
  rng.setEnd(finish.dom(), foffset);
  return rng;
};

// Return the deepest - or furthest down the document tree - Node that contains both boundary points
// of the range (start:soffset, finish:foffset).
const commonAncestorContainer = function (start: Element, soffset: number, finish: Element, foffset: number) {
  const r = makeRange(start, soffset, finish, foffset);
  return Element.fromDom(r.commonAncestorContainer);
};

const after = function (start: Element, soffset: number, finish: Element, foffset: number) {
  const r = makeRange(start, soffset, finish, foffset);

  const same = Compare.eq(start, finish) && soffset === foffset;
  return r.collapsed && !same;
};

export {
  after,
  commonAncestorContainer,
};