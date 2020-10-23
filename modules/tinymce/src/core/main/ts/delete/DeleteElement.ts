/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj, Optional, Optionals } from '@ephox/katamari';
import { Insert, PredicateFind, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as CaretCandidate from '../caret/CaretCandidate';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as MergeText from './MergeText';

const needsReposition = (pos: CaretPosition, elm: Node) => {
  const container = pos.container();
  const offset = pos.offset();
  return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
};

const reposition = (elm: Node, pos: CaretPosition) =>
  needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;

const beforeOrStartOf = (node: Node) =>
  NodeType.isText(node) ? CaretPosition(node, 0) : CaretPosition.before(node);

const afterOrEndOf = (node: Node) =>
  NodeType.isText(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);

const getPreviousSiblingCaretPosition = (elm: Node): Optional<CaretPosition> => {
  if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
    return Optional.some(afterOrEndOf(elm.previousSibling));
  } else {
    return elm.previousSibling ? CaretFinder.lastPositionIn(elm.previousSibling) : Optional.none();
  }
};

const getNextSiblingCaretPosition = (elm: Node): Optional<CaretPosition> => {
  if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
    return Optional.some(beforeOrStartOf(elm.nextSibling));
  } else {
    return elm.nextSibling ? CaretFinder.firstPositionIn(elm.nextSibling) : Optional.none();
  }
};

const findCaretPositionBackwardsFromElm = (rootElement: Node, elm: Node) => {
  const startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
  return CaretFinder.prevPosition(rootElement, startPosition).fold(
    () => CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)),
    Optional.some
  );
};

const findCaretPositionForwardsFromElm = (rootElement: Node, elm: Node) =>
  CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)).fold(
    () => CaretFinder.prevPosition(rootElement, CaretPosition.before(elm)),
    Optional.some
  );

const findCaretPositionBackwards = (rootElement: Node, elm: Node) =>
  getPreviousSiblingCaretPosition(elm).orThunk(() => getNextSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionBackwardsFromElm(rootElement, elm));

const findCaretPositionForward = (rootElement: Node, elm: Node) =>
  getNextSiblingCaretPosition(elm)
    .orThunk(() => getPreviousSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionForwardsFromElm(rootElement, elm));

const findCaretPosition = (forward: boolean, rootElement: Node, elm: Node) =>
  forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);

const findCaretPosOutsideElmAfterDelete = (forward: boolean, rootElement: Node, elm: Node) =>
  findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));

const setSelection = (editor: Editor, forward: boolean, pos: Optional<CaretPosition>) => {
  pos.fold(
    () => {
      editor.focus();
    },
    (pos) => {
      editor.selection.setRng(pos.toRange(), forward);
    }
  );
};

const eqRawNode = (rawNode: Node) => (elm: SugarElement) => elm.dom === rawNode;

const isBlock = (editor: Editor, elm: SugarElement) =>
  elm && Obj.has(editor.schema.getBlockElements(), SugarNode.name(elm));

const paddEmptyBlock = (elm: SugarElement): Optional<CaretPosition> => {
  if (Empty.isEmpty(elm)) {
    const br = SugarElement.fromHtml('<br data-mce-bogus="1">');
    Remove.empty(elm);
    Insert.append(elm, br);
    return Optional.some(CaretPosition.before(br.dom));
  } else {
    return Optional.none();
  }
};

const deleteNormalized = (elm: SugarElement, afterDeletePosOpt: Optional<CaretPosition>, normalizeWhitespace?: boolean): Optional<CaretPosition> => {
  const prevTextOpt = Traverse.prevSibling(elm).filter(SugarNode.isText);
  const nextTextOpt = Traverse.nextSibling(elm).filter(SugarNode.isText);

  // Delete the element
  Remove.remove(elm);

  // Merge and normalize any prev/next text nodes, so that they are merged and don't lose meaningful whitespace
  // eg. <p>a <span></span> b</p> -> <p>a &nsbp;b</p> or <p><span></span> a</p> -> <p>&nbsp;a</a>
  return Optionals.lift3(prevTextOpt, nextTextOpt, afterDeletePosOpt, (prev, next, pos) => {
    const prevNode = prev.dom, nextNode = next.dom;
    const offset = prevNode.data.length;
    MergeText.mergeTextNodes(prevNode, nextNode, normalizeWhitespace);
    // Update the cursor position if required
    return pos.container() === nextNode ? CaretPosition(prevNode, offset) : pos;
  }).orThunk(() => {
    if (normalizeWhitespace) {
      prevTextOpt.each((elm) => MergeText.normalizeWhitespaceBefore(elm.dom, elm.dom.length));
      nextTextOpt.each((elm) => MergeText.normalizeWhitespaceAfter(elm.dom, 0));
    }
    return afterDeletePosOpt;
  });
};

const isInlineElement = (editor: Editor, element: SugarElement): boolean =>
  Obj.has(editor.schema.getTextInlineElements(), SugarNode.name(element));

const deleteElement = (editor: Editor, forward: boolean, elm: SugarElement, moveCaret: boolean = true) => {
  const afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom);
  const parentBlock = PredicateFind.ancestor(elm, Fun.curry(isBlock, editor), eqRawNode(editor.getBody()));
  const normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos, isInlineElement(editor, elm));

  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    editor.selection.setCursorLocation();
  } else {
    parentBlock.bind(paddEmptyBlock).fold(
      () => {
        if (moveCaret) {
          setSelection(editor, forward, normalizedAfterDeletePos);
        }
      },
      (paddPos) => {
        if (moveCaret) {
          setSelection(editor, forward, Optional.some(paddPos));
        }
      }
    );
  }
};

export {
  deleteElement
};
