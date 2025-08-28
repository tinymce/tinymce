import { Optional } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as Traverse from '../../api/search/Traverse';
import * as CursorPosition from '../../api/selection/CursorPosition';

/*
 * When a node has children, we return either the first or the last cursor
 * position, whichever is closer horizontally
 *
 * When a node has no children, we return the start of end of the element,
 * depending on which is closer horizontally
 * */

// TODO: Make this RTL compatible
const COLLAPSE_TO_LEFT = true;
const COLLAPSE_TO_RIGHT = false;

const getCollapseDirection = (rect: ClientRect | DOMRect, x: number): boolean =>
  x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;

const createCollapsedNode = (doc: SugarElement<Document>, target: SugarElement<Node>, collapseDirection: boolean): Range => {
  const r = doc.dom.createRange();
  r.selectNode(target.dom);
  r.collapse(collapseDirection);
  return r;
};

const locateInElement = (doc: SugarElement<Document>, node: SugarElement<Element>, x: number): Optional<Range> => {
  const cursorRange = doc.dom.createRange();
  cursorRange.selectNode(node.dom);
  const rect = cursorRange.getBoundingClientRect();
  const collapseDirection = getCollapseDirection(rect, x);

  const f = collapseDirection === COLLAPSE_TO_LEFT ? CursorPosition.first : CursorPosition.last;
  return f(node).map((target) => createCollapsedNode(doc, target, collapseDirection));
};

const locateInEmpty = (doc: SugarElement<Document>, node: SugarElement<Element>, x: number): Optional<Range> => {
  const rect = node.dom.getBoundingClientRect();
  const collapseDirection = getCollapseDirection(rect, x);
  return Optional.some(createCollapsedNode(doc, node, collapseDirection));
};

const search = (doc: SugarElement<Document>, node: SugarElement<Element>, x: number): Optional<Range> => {
  const f = Traverse.children(node).length === 0 ? locateInEmpty : locateInElement;
  return f(doc, node, x);
};

export { search };
