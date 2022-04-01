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

const getParentBlock = (node: Node, rootNode: Node): Node => {
  const scope = PredicateFind.closest(SugarElement.fromDom(node), isBlock, (elm) => Compare.eq(SugarElement.fromDom(rootNode), elm));
  return scope.getOr(SugarElement.fromDom(rootNode)).dom;
};

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
  if (isText(startNode)) {
    rng.setStart(startNode, 0);
  } else {
    rng.setStartBefore(startNode);
  }
  if (isText(endNode)) {
    rng.setEnd(endNode, endNode.data.length);
  } else {
    rng.setEndAfter(endNode);
  }
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
