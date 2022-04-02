import { Compare, PredicateFind, SugarElement } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import { isCaretCandidate } from '../caret/CaretCandidate';
import { CaretPosition } from '../caret/CaretPosition';
import { isBlock } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from './RangeNormalizer';

const isBr = NodeType.isBr;
const isText = NodeType.isText;
const isContentEditableFalse = (elm: SugarElement<Node>): boolean => NodeType.isContentEditableFalse(elm.dom);
const isRoot = (rootNode: Node) => (elm: SugarElement<Node>): boolean => Compare.eq(SugarElement.fromDom(rootNode), elm);

const getParentBlock = (node: Node, rootNode: Node): Node =>
  PredicateFind.closest(SugarElement.fromDom(node), isBlock, isRoot(rootNode))
    .getOr(SugarElement.fromDom(rootNode)).dom;

const getParentCef = (node: Node, rootNode: Node) =>
  PredicateFind.closest(SugarElement.fromDom(node), isContentEditableFalse, isRoot(rootNode));

const walkBackwardWhile = (startNode: Node, scope: Node): Node => {
  const walker = new DomTreeWalker(startNode, scope);
  let result: Node = startNode;
  for (let prev = walker.prev(); prev && !isBr(prev); prev = walker.prev()) {
    if (isCaretCandidate(prev)) {
      result = prev;
    }
  }
  return result;
};

const walkForwardWhile = (startNode: Node, scope: Node): Node => {
  const walker = new DomTreeWalker(startNode, scope);
  let result: Node = startNode;
  for (let next = startNode; next && !isBr(next); next = walker.next()) {
    if (isCaretCandidate(next)) {
      result = next;
    }
  }
  return result;
};

const findClosestBlockRange = (startRng: Range, rootNode: Node) => {
  const startPos = CaretPosition.fromRangeStart(startRng);
  const clickNode = startPos.getNode();
  const scope = getParentBlock(clickNode, rootNode);
  const startNode = walkBackwardWhile(clickNode, scope);
  const endNode = walkForwardWhile(clickNode, scope);

  const rng = document.createRange();
  getParentCef(startNode, scope).fold(() => {
    if (isText(startNode)) {
      rng.setStart(startNode, 0);
    } else {
      rng.setStartBefore(startNode);
    }
  }, (cef) => rng.setStartBefore(cef.dom));

  getParentCef(endNode, scope).fold(() => {
    if (isText(endNode)) {
      rng.setEnd(endNode, endNode.data.length);
    } else {
      rng.setEndAfter(endNode);
    }
  }, (cef) => rng.setEndAfter(cef.dom));
  return rng;
};

const onTripleClickSelect = (editor) => {
  const rng = findClosestBlockRange(editor.selection.getRng(), editor.getBody());
  editor.selection.setRng(RangeNormalizer.normalize(rng));
};

const setup = (editor: Editor) => {
  editor.on('mousedown', (e) => {
    if (e.detail >= 3) {
      e.preventDefault();
      onTripleClickSelect(editor);
    }
  });
};

export {
  findClosestBlockRange,
  setup
};
