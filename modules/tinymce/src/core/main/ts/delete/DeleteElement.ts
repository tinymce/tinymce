/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node as DomNode } from '@ephox/dom-globals';
import { Fun, Obj, Option, Options } from '@ephox/katamari';
import { Element, Insert, Node as SugarNode, Node, PredicateFind, Remove, Traverse } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as CaretCandidate from '../caret/CaretCandidate';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as MergeText from './MergeText';

const needsReposition = (pos: CaretPosition, elm: DomNode) => {
  const container = pos.container();
  const offset = pos.offset();
  return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
};

const reposition = (elm: DomNode, pos: CaretPosition) =>
  needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;

const beforeOrStartOf = (node: DomNode) =>
  NodeType.isText(node) ? CaretPosition(node, 0) : CaretPosition.before(node);

const afterOrEndOf = (node: DomNode) =>
  NodeType.isText(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);

const getPreviousSiblingCaretPosition = (elm: DomNode): Option<CaretPosition> => {
  if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
    return Option.some(afterOrEndOf(elm.previousSibling));
  } else {
    return elm.previousSibling ? CaretFinder.lastPositionIn(elm.previousSibling) : Option.none();
  }
};

const getNextSiblingCaretPosition = (elm: DomNode): Option<CaretPosition> => {
  if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
    return Option.some(beforeOrStartOf(elm.nextSibling));
  } else {
    return elm.nextSibling ? CaretFinder.firstPositionIn(elm.nextSibling) : Option.none();
  }
};

const findCaretPositionBackwardsFromElm = (rootElement: DomNode, elm: DomNode) => {
  const startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
  return CaretFinder.prevPosition(rootElement, startPosition).fold(
    () => CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)),
    Option.some
  );
};

const findCaretPositionForwardsFromElm = (rootElement: DomNode, elm: DomNode) =>
  CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)).fold(
    () => CaretFinder.prevPosition(rootElement, CaretPosition.before(elm)),
    Option.some
  );

const findCaretPositionBackwards = (rootElement: DomNode, elm: DomNode) =>
  getPreviousSiblingCaretPosition(elm).orThunk(() => getNextSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionBackwardsFromElm(rootElement, elm));

const findCaretPositionForward = (rootElement: DomNode, elm: DomNode) =>
  getNextSiblingCaretPosition(elm)
    .orThunk(() => getPreviousSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionForwardsFromElm(rootElement, elm));

const findCaretPosition = (forward: boolean, rootElement: DomNode, elm: DomNode) =>
  forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);

const findCaretPosOutsideElmAfterDelete = (forward: boolean, rootElement: DomNode, elm: DomNode) =>
  findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));

const setSelection = (editor: Editor, forward: boolean, pos: Option<CaretPosition>) => {
  pos.fold(
    () => {
      editor.focus();
    },
    (pos) => {
      editor.selection.setRng(pos.toRange(), forward);
    }
  );
};

const eqRawNode = (rawNode: DomNode) => (elm: Element) => elm.dom() === rawNode;

const isBlock = (editor: Editor, elm: Element) =>
  elm && Obj.has(editor.schema.getBlockElements(), SugarNode.name(elm));

const paddEmptyBlock = (elm: Element): Option<CaretPosition> => {
  if (Empty.isEmpty(elm)) {
    const br = Element.fromHtml('<br data-mce-bogus="1">');
    Remove.empty(elm);
    Insert.append(elm, br);
    return Option.some(CaretPosition.before(br.dom()));
  } else {
    return Option.none();
  }
};

const deleteNormalized = (elm: Element, afterDeletePosOpt: Option<CaretPosition>, normalizeWhitespace?: boolean): Option<CaretPosition> => {
  const prevTextOpt = Traverse.prevSibling(elm).filter(Node.isText);
  const nextTextOpt = Traverse.nextSibling(elm).filter(Node.isText);

  // Delete the element
  Remove.remove(elm);

  // Merge and normalize any prev/next text nodes, so that they are merged and don't lose meaningful whitespace
  // eg. <p>a <span></span> b</p> -> <p>a &nsbp;b</p> or <p><span></span> a</p> -> <p>&nbsp;a</a>
  return Options.lift3(prevTextOpt, nextTextOpt, afterDeletePosOpt, (prev, next, pos) => {
    const prevNode = prev.dom(), nextNode = next.dom();
    const offset = prevNode.data.length;
    MergeText.mergeTextNodes(prevNode, nextNode, normalizeWhitespace);
    // Update the cursor position if required
    return pos.container() === nextNode ? CaretPosition(prevNode, offset) : pos;
  }).orThunk(() => {
    if (normalizeWhitespace) {
      prevTextOpt.each((elm) => MergeText.normalizeWhitespaceBefore(elm.dom(), elm.dom().length));
      nextTextOpt.each((elm) => MergeText.normalizeWhitespaceAfter(elm.dom(), 0));
    }
    return afterDeletePosOpt;
  });
};

const isInlineElement = (editor: Editor, element: Element): boolean =>
  Obj.has(editor.schema.getTextInlineElements(), SugarNode.name(element));

const deleteElement = (editor: Editor, forward: boolean, elm: Element, moveCaret: boolean = true) => {
  const afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom());
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
          setSelection(editor, forward, Option.some(paddPos));
        }
      }
    );
  }
};

export {
  deleteElement
};
