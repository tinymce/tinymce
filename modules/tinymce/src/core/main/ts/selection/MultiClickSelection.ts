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

const getClosestBlock = (node: Node, rootNode: Node): Node =>
  PredicateFind.closest(SugarElement.fromDom(node), isBlock, isRoot(rootNode))
    .getOr(SugarElement.fromDom(rootNode)).dom;

const getClosestCef = (node: Node, rootNode: Node) =>
  PredicateFind.closest(SugarElement.fromDom(node), isContentEditableFalse, isRoot(rootNode));

const findEdgeCaretCandidate = (startNode: Node, scope: Node, forward: boolean): Node => {
  const walker = new DomTreeWalker(startNode, scope);
  const next = forward ? walker.next.bind(walker) : walker.prev.bind(walker);
  let result: Node = startNode;
  for (let current = forward ? startNode : next(); current && !isBr(current); current = next()) {
    if (isCaretCandidate(current)) {
      result = current;
    }
  }
  return result;
};

const findClosestBlockRange = (startRng: Range, rootNode: Node) => {
  const startPos = CaretPosition.fromRangeStart(startRng);
  const clickNode = startPos.getNode();
  const scope = getClosestBlock(clickNode, rootNode);
  const startNode = findEdgeCaretCandidate(clickNode, scope, false);
  const endNode = findEdgeCaretCandidate(clickNode, scope, true);

  const rng = document.createRange();
  getClosestCef(startNode, scope).fold(() => {
    if (isText(startNode)) {
      rng.setStart(startNode, 0);
    } else {
      rng.setStartBefore(startNode);
    }
  }, (cef) => rng.setStartBefore(cef.dom));

  getClosestCef(endNode, scope).fold(() => {
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
