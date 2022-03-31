import { SugarElement } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import { isCaretCandidate } from '../caret/CaretCandidate';
import { CaretPosition } from '../caret/CaretPosition';
import { isBlock } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from './RangeNormalizer';

const isBr = NodeType.isBr;
const isText = NodeType.isText;

const isBoundary = (node: Node): boolean => {
  return isBr(node) || isBlock(SugarElement.fromDom(node));
};

const walkBackwardWhile = (startNode: Node, rootNode: Node): Node => {
  const walker = new DomTreeWalker(startNode, rootNode);
  let result: Node = startNode;
  for (let next = walker.prev(); next && !isBoundary(next); next = walker.prev()) {
    if (isCaretCandidate(next)) {
      result = next;
    }
  }
  return result;
};

const walkForwardWhile = (startNode: Node, rootNode: Node): Node => {
  const walker = new DomTreeWalker(startNode, rootNode);
  let result: Node = startNode;
  for (let next = startNode; next && !isBoundary(next); next = walker.next()) {
    if (isCaretCandidate(next)) {
      result = next;
    }
  }
  return result;
};

const findClosestBlockRange = (startRng: Range, rootNode: Node) => {
  const startPos = CaretPosition.fromRangeStart(startRng);
  const clickNode = startPos.getNode();
  const startNode = walkBackwardWhile(clickNode, rootNode);
  const endNode = walkForwardWhile(clickNode, rootNode);

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
