import { Compare, PredicateFind, SugarElement, SugarNode } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import { isCaretCandidate } from '../caret/CaretCandidate';
import { CaretPosition } from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from './RangeNormalizer';

const isBr = NodeType.isBr;
const isText = NodeType.isText;
const isContentEditableFalse = (elm: SugarElement<Node>): boolean => NodeType.isContentEditableFalse(elm.dom);
const isContentEditableTrue = (elm: SugarElement<Node>): boolean => NodeType.isContentEditableTrue(elm.dom);
const isRoot = (rootNode: Node) => (elm: SugarElement<Node>): boolean => Compare.eq(SugarElement.fromDom(rootNode), elm);

const getClosestScope = (node: Node, rootNode: Node, schema: Schema): Node =>
  PredicateFind.closest(SugarElement.fromDom(node), (elm) => isContentEditableTrue(elm) || schema.isBlock(SugarNode.name(elm)), isRoot(rootNode))
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

const findClosestBlockRange = (startRng: Range, rootNode: Node, schema: Schema): Range => {
  const startPos = CaretPosition.fromRangeStart(startRng);
  // TODO: TINY-8865 - This may not be safe to cast as Node and alternative solutions need to be looked into
  const clickNode = startPos.getNode() as Node;
  const scope = getClosestScope(clickNode, rootNode, schema);
  const startNode = findEdgeCaretCandidate(clickNode, scope, false);
  const endNode = findEdgeCaretCandidate(clickNode, scope, true);

  const rng = document.createRange();
  getClosestCef(startNode, scope).fold(
    () => {
      if (isText(startNode)) {
        rng.setStart(startNode, 0);
      } else {
        rng.setStartBefore(startNode);
      }
    },
    (cef) => rng.setStartBefore(cef.dom)
  );

  getClosestCef(endNode, scope).fold(
    () => {
      if (isText(endNode)) {
        rng.setEnd(endNode, endNode.data.length);
      } else {
        rng.setEndAfter(endNode);
      }
    },
    (cef) => rng.setEndAfter(cef.dom)
  );
  return rng;
};

const onTripleClickSelect = (editor: Editor): void => {
  const rng = findClosestBlockRange(editor.selection.getRng(), editor.getBody(), editor.schema);
  editor.selection.setRng(RangeNormalizer.normalize(rng));
};

const setup = (editor: Editor): void => {
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
