import { SugarElement } from '../node/SugarElement';
import * as Traverse from '../search/Traverse';
import * as Compare from './Compare';

const makeRange = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): Range => {
  const doc = Traverse.owner(start);

  // TODO: We need to think about a better place to put native range creation code. Does it even belong in sugar?
  // Could the `Compare` checks (node.compareDocumentPosition) handle these situations better?
  const rng = doc.dom.createRange();
  rng.setStart(start.dom, soffset);
  rng.setEnd(finish.dom, foffset);
  return rng;
};

// Return the deepest - or furthest down the document tree - Node that contains both boundary points
// of the range (start:soffset, finish:foffset).
const commonAncestorContainer = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): SugarElement<Node> => {
  const r = makeRange(start, soffset, finish, foffset);
  return SugarElement.fromDom(r.commonAncestorContainer);
};

const after = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): boolean => {
  const r = makeRange(start, soffset, finish, foffset);

  const same = Compare.eq(start, finish) && soffset === foffset;
  return r.collapsed && !same;
};

export {
  after,
  commonAncestorContainer
};
